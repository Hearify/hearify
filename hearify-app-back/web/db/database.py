import redis.asyncio as redis
from dependency_injector.providers import ThreadSafeSingleton
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient

from core.config import MONGODB_URL, MONGODB_DATABASE


def get_redis() -> redis:
    """"""
    return redis.from_url("redis://redis:6379/4")


def get_db() -> AsyncIOMotorDatabase:
    """Connects to MongoDB instance and returns current DB"""
    return AsyncIOMotorClient(MONGODB_URL).get_database(MONGODB_DATABASE)


DatabaseProvider: AsyncIOMotorDatabase = ThreadSafeSingleton(get_db)
