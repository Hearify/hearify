from typing import List
from datetime import datetime

from bson import ObjectId
from pymongo import UpdateOne

from repository.base import BaseRepository
from schemas.quizzes import QuizBase, QuizPublic

from schemas.quizzes import Roles


class QuizRepository(BaseRepository):
    """Main repository for quizzes collection"""

    _collection_name = "quizzes"

    async def _populate_questions(self, raw_quizzes: List[dict]):
        """"""
        for raw_quiz in raw_quizzes:
            raw_questions = await self.database.questions.find(
                {"_id": {"$in": raw_quiz["questions"]}}
            ).to_list(length=None)
            raw_quiz["questions"] = raw_questions

        return raw_quizzes

    async def _construct_payloads(
        self,
        diff: dict,
        quiz_id: ObjectId,
    ) -> tuple:
        """"""

        values = {**diff}
        try:
            questions = values.pop("questions")
        except KeyError:
            questions = None

        quiz_payload = {"_id": quiz_id, "payload": values}

        questions_payloads = []
        if questions:
            for question_id, values in questions.items():

                answers = values.pop("answers", {})
                question_payload = {"_id": question_id, "payload": values}

                for idx, answer_values in answers.items():
                    for key, value in answer_values.items():
                        question_payload["payload"].update(
                            {f"answers.{idx}.{key}": value}
                        )

                questions_payloads.append(question_payload)

        return quiz_payload, questions_payloads

    async def get_all(
        self,
        skip: int,
        limit: int,
        _filter: dict,
        sort: dict | None,
    ) -> List[QuizPublic]:
        """"""

        raw_quizzes = await self.raw_get_all(
            sort=sort,
            skip=skip,
            limit=limit,
            _filter=_filter,
        )

        raw_quizzes = await self._populate_questions(raw_quizzes=raw_quizzes)

        return [QuizPublic.model_validate(quiz) for quiz in raw_quizzes]

    async def create(
        self,
        values: dict,
        question_ids: List[ObjectId],
    ) -> ObjectId:
        """"""

        now_ = datetime.utcnow()

        quiz = QuizBase.model_validate(values)

        result = await self.collection.insert_one(
            {
                **quiz.model_dump(),
                "created_at": now_,
                "updated_at": now_,
                "questions": question_ids,
                "user_id": ObjectId(quiz.user_id),
            }
        )

        return result.inserted_id

    async def get_by_field(self, field: str, value: any) -> QuizPublic | None:
        """"""

        raw_quiz = await self.collection.find_one({field: value})

        if not raw_quiz:
            return None

        raw_quizzes = await self._populate_questions(raw_quizzes=[raw_quiz])

        return QuizPublic.model_validate(raw_quizzes[0])

    async def delete_question(self, quiz_id: ObjectId, question_id: ObjectId):
        """"""

        await self.collection.update_one(
            {"_id": quiz_id},
            {
                "$pull": {
                    "questions": ObjectId(question_id),
                }
            },
        )

    async def delete_by_id(self, quiz_id: ObjectId):
        """"""

        await self.collection.delete_one({"_id": quiz_id})

    async def update_by_id(self, quiz_id: ObjectId, values: dict):
        """"""

        quiz_payload, questions_payloads = await self._construct_payloads(
            quiz_id=quiz_id, diff=values
        )

        now_ = datetime.utcnow()

        await self.collection.update_one(
            {"_id": quiz_payload["_id"]},
            {
                "$set": {
                    **quiz_payload["payload"],
                    "updated_at": now_,
                }
            },
        )

        if questions_payloads:
            await self.database["questions"].bulk_write(
                [
                    UpdateOne(
                        {"_id": payload["_id"]},
                        {
                            "$set": {
                                **payload["payload"],
                                "updated_at": now_,
                            }
                        },
                    )
                    for payload in questions_payloads
                ]
            )

    async def add_question(self, class_code: str, question_id: str):

        update_result = await self.collection.update_one(
            {"class_code": class_code},
            {"$push": {"questions": ObjectId(question_id)}},
        )

        return update_result.modified_count

    async def add_member(self, class_code: str, role: Roles, user_id: str):

        if role == Roles.OWNER:
            update = {"$push": {"members.owners": ObjectId(user_id)}}
        elif role == Roles.EDITOR:
            update = {"$push": {"members.editors": ObjectId(user_id)}}
        else:
            update = {"$push": {"members.viewers": ObjectId(user_id)}}

        update_result = await self.collection.update_one(
            {"class_code": class_code}, update=update
        )

        return update_result.modified_count

    async def delete_member(self, class_code: str, user_id: str):

        deletion_result = await self.collection.update_one(
            {"class_code": class_code},
            {
                "$pull": {
                    "members.owners": ObjectId(user_id),
                    "members.editors": ObjectId(user_id),
                    "members.viewers": ObjectId(user_id),
                }
            },
        )

        return deletion_result.modified_count

    async def change_member_role(
        self, class_code: str, role: Roles, user_id: str
    ):

        deletion_result = await self.delete_member(class_code, user_id)

        if not deletion_result:
            raise ValueError("Something went wrong")

        update_result = await self.add_member(class_code, role, user_id)

        return update_result
