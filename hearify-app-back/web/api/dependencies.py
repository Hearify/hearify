import re

from fastapi import HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from db.database import DatabaseProvider
from repository.users import UserRepository
from repository.quizzes import QuizRepository
from repository.questions import QuestionRepository
from repository.subscriptions import SubscriptionsRepository
from repository.quiz_process import QuizProcessRepository
from repository.brand_kit import BrandKitRepository
from repository.roadmaps import RoadmapRepository
from core.security import decode_access_token, JWTBearer
from repository.group_management import GroupRepository


def get_database() -> AsyncIOMotorDatabase:
    """"""
    return DatabaseProvider()


# REPOSITORIES STUFF
def get_user_repository() -> UserRepository:
    return UserRepository(database=get_database())


def get_quiz_repository() -> QuizRepository:
    return QuizRepository(database=get_database())


def get_question_repository() -> QuestionRepository:
    return QuestionRepository(database=get_database())


def get_roadmap_repository() -> RoadmapRepository:
    return RoadmapRepository(database=get_database())


def get_group_repository() -> GroupRepository:
    return GroupRepository(database=get_database())


async def get_subscriptions_repository() -> SubscriptionsRepository:
    return SubscriptionsRepository(database=get_database())


async def get_quiz_process_repository() -> QuizProcessRepository:
    return QuizProcessRepository(database=get_database())


async def get_brand_kit_repository() -> BrandKitRepository:
    return BrandKitRepository(database=get_database())


async def get_current_user(
    user_repo: UserRepository = Depends(get_user_repository),
    token: str = Depends(JWTBearer()),
):
    """"""

    cred_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credentials are not valid.",
    )

    payload = await decode_access_token(token)

    if not payload:
        raise cred_exception

    user_id = payload.get("sub")
    user_email = None

    if not re.match(r"^[a-fA-F0-9]{24}$", user_id):
        user_id = None
        user_email = payload.get("email")

        if not user_email:
            raise cred_exception

    user = await user_repo.get_by_id(user_id=user_id)

    if not user:
        if user_email:
            user = await user_repo.get_by_field(field="email", value=user_email)
        else:
            return cred_exception

    return user
