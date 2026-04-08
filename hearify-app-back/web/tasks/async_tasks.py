from db.database import AsyncIOMotorDatabase
from schemas.quizzes import GeneratedQuiz, GeneratedRoadmap
from tasks.utils import save_generated_quiz, save_generation_info, save_generated_roadmap, save_new_subtopic, save_regenerated_subtopics


async def generate_quiz(
    user_id: str,
    class_code: str,
    quiz: GeneratedQuiz,
    generation_payload: dict,
    database: AsyncIOMotorDatabase,
    settings: dict,  # = {"minutes": 5},
):

    await save_generated_quiz(
        quiz=quiz, user_id=user_id, database=database, class_code=class_code, settings=settings
    )

    await save_generation_info(
        user_id=user_id,
        database=database,
        class_code=class_code,
        generation_payload=generation_payload,
    )


async def generate_roadmap(
        user_id: str,
        class_code: str,
        roadmap: GeneratedRoadmap,
        generation_payload: dict,
        database: AsyncIOMotorDatabase,
):
    await save_generated_roadmap(
        roadmap=roadmap, user_id=user_id, database=database, class_code=class_code
    )


async def add_new_subtopic(
        class_code: str,
        subtopic: dict,
        database: AsyncIOMotorDatabase,
        topic_name: str,
):
    await save_new_subtopic(class_code=class_code, subtopic=subtopic, database=database, topic_name=topic_name)


async def regenerate_subtopics_task(
        class_code: str,
        subtopics: dict,
        database: AsyncIOMotorDatabase,
        topic_name: str,
):
    await save_regenerated_subtopics(class_code=class_code, subtopics=subtopics, database=database, topic_name=topic_name)