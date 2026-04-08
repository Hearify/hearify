from datetime import datetime
from typing import List

from bson import ObjectId

from ext import get_empty_questions
from repository.base import BaseRepository
from schemas.questions import QuestionBase, QuestionDB, QuestionTypesDB


class QuestionRepository(BaseRepository):
    """Main repository for questions collection"""

    _collection_name = "questions"

    async def get_all(
        self,
        skip: int,
        _filter: dict,
        limit: int | None,
        sort: dict | None,
    ) -> List[QuestionBase]:
        """"""

        raw_questions = await self.raw_get_all(
            sort=sort,
            skip=skip,
            limit=limit,
            _filter=_filter,
        )

        return [QuestionBase.model_validate(question) for question in raw_questions]

    async def get_by_id(self, question_id: str) -> QuestionBase:
        question = await self.get_by_field(field="_id", value=ObjectId(question_id))
        return question

    async def create_many(self, questions: list[QuestionBase]) -> list[ObjectId]:
        """"""

        results = await self.collection.insert_many(
            [
                {
                    **question.model_dump(),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
                for question in questions
            ]
        )

        return results.inserted_ids

    async def update(self, question_id: ObjectId, payload: dict) -> QuestionDB:
        """"""

        await self.collection.update_one({"_id": question_id}, {"$set": {**payload}})

        return await self.get_by_field(field="_id", value=ObjectId(question_id))

    async def delete_by_ids(self, question_ids: List[str]):
        """"""

        await self.collection.delete_many(
            {"_id": {"$in": [ObjectId(question_id) for question_id in question_ids]}}
        )

    async def get_by_field(self, field: str, value: any) -> QuestionDB | None:
        """"""

        raw_question = await self.collection.find_one({field: value})

        if not raw_question:
            return None

        return QuestionDB.model_validate(raw_question)

    async def get_user_ids(self, question_id: str) -> set:
        """"""
        results = await self.database.quizzes.find(
            {"questions": {"$elemMatch": {"$in": [ObjectId(question_id)]}}},
            {"user_id": 1, "_id": 0},
        ).to_list(length=None)

        return set([result["user_id"] for result in results])

    async def create_empty(self, type_: str):
        question = {}

        if type_ not in [data.value for data in QuestionTypesDB]:
            raise ValueError

        elif type_ in [
            "single_choice",
            "multiple_choice",
            "fill_in",
            "fc_fill_in",
            "fc_translate",
            "fc_enter_what_heard",
            "fc_picture_answer",
            "fc_record_answer",
            "fc_key_concept",
        ]:
            question = get_empty_questions.single_multiple_fill_in(type_)

        elif type_ == "matching":
            question = get_empty_questions.matching(type_)

        elif type_ == "opened":
            question = get_empty_questions.open(type_)

        elif type_ == "binary":
            question = get_empty_questions.binary(type_)

        if question:
            new_question = await self.collection.insert_one(question)
            return str(new_question.inserted_id)
