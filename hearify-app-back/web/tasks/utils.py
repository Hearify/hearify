from datetime import datetime

from bson import ObjectId

from db.database import AsyncIOMotorDatabase
from repository.questions import QuestionRepository
from repository.quizzes import QuizRepository
from repository.roadmaps import RoadmapRepository
from schemas.quizzes import GeneratedQuiz, GeneratedRoadmap

# import logging
# from fastapi.encoders import jsonable_encoder

# logger = logging.getLogger("uvicorn.error")


async def save_generated_quiz(
    user_id: str,
    class_code: str,
    quiz: GeneratedQuiz,
    database: AsyncIOMotorDatabase,
    settings: dict,  # = {"minutes": 5}
) -> ObjectId:

    quiz_repo = QuizRepository(database=database)
    question_repo = QuestionRepository(database=database)

    question_ids = await question_repo.create_many(questions=quiz.questions)

    members = {"owners": [], "editors": [], "viewers": []}

    quiz_id = await quiz_repo.create(
        values={
            "name": quiz.name,
            "user_id": user_id,
            "class_code": class_code,
            "settings": settings,
            "members": members,
        },
        question_ids=question_ids,
    )

    return quiz_id


async def save_generation_info(
    user_id: str,
    class_code: str,
    generation_payload: dict,
    database: AsyncIOMotorDatabase,
    error: str | None = None,
):
    """"""

    now_ = datetime.utcnow()

    await database["generated_info"].insert_one(
        {
            "user_id": user_id,
            "class_code": class_code,
            "error": error,
            "created_at": now_,
            "payload": generation_payload,
        }
    )


async def save_generated_roadmap(
    user_id: str,
    class_code: str,
    roadmap: GeneratedRoadmap,
    database: AsyncIOMotorDatabase,
) -> ObjectId:
    roadmap_repo = RoadmapRepository(database=database)
    roadmap_id = await roadmap_repo.create(
        values={
            "name": roadmap.name,
            "user_id": user_id,
            "class_code": class_code,
            "topics": roadmap.topics
        }
    )
    return roadmap_id


async def save_new_subtopic(
        class_code: str,
        subtopic: dict,
        topic_name: str,
        database: AsyncIOMotorDatabase,
):
    roadmap_repo = RoadmapRepository(database=database)
    await roadmap_repo.add_generated_subtopic(class_code=class_code, subtopic=subtopic, topic_name=topic_name)


async def save_regenerated_subtopics(
        class_code: str,
        subtopics: dict,
        topic_name: str,
        database: AsyncIOMotorDatabase,
):
    roadmap_repo = RoadmapRepository(database=database)
    await roadmap_repo.add_regenerated_subtopics(class_code=class_code, subtopics=subtopics, topic_name=topic_name)