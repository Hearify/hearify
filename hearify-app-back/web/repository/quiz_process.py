import logging

from bson import ObjectId
from repository.base import BaseRepository
from schemas.quiz_processes import QuizProcessDTO

class QuizProcessRepository(BaseRepository):

    async def get_process_by_id(self, process_id: str):

        collection = self.database.get_collection('quiz_process')

        process = await collection.find_one(
            {"_id": ObjectId(process_id)}
        )

        if not process:
            raise ValueError

        process['id'] = str(process.pop('_id'))

        try:
            process['user_id'] = str(process.pop('user_id'))
        except KeyError:
            pass

        return QuizProcessDTO(**process)


    async def get_distinct_processes_by_class_code(self, class_code: str, limit: int = None, skip: int = 1):
        collection = self.database.get_collection('quiz_process')

        filter = {"class_code": class_code, "is_submitted": True}

        unique_user_ids = await collection.distinct("user_id", filter=filter)

        registered_users_results = []
        for user_id in unique_user_ids:

            doc = await collection.find_one(
                {"class_code": class_code, "user_id": user_id, "is_submitted": True},
                sort=[("submitted_at", -1)]
            )

            if doc:
                doc['id'] = str(doc.pop('_id'))
                registered_users_results.append(doc)

        non_registered_users_results = []
        public_results = collection.find(
            filter={"$and": [filter, {"is_public": True}]}
        )
        async for doc in public_results:
            doc['id'] = str(doc.pop('_id'))
            non_registered_users_results.append(doc)

        result = registered_users_results + non_registered_users_results

        return result[0:limit:skip]




