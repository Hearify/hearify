import string
import random
from contextlib import asynccontextmanager
from typing import Dict

from fastapi import FastAPI
from fastapi_limiter import FastAPILimiter

from db.database import get_redis, DatabaseProvider
from api.dependencies import get_quiz_repository


@asynccontextmanager
async def lifespan(app: FastAPI):
    """"""
    redis_conn = get_redis()
    database = DatabaseProvider()
    await FastAPILimiter.init(redis_conn)

    yield

    await FastAPILimiter.close()
    database.client.close()


def split_fullname_to_dict(fullname: str) -> dict[str, str | None]:
    names = fullname.split(maxsplit=1)
    first_name = names[0]
    surname = names[1] if len(names) > 1 else None
    return {'first_name': first_name, 'surname': surname}

async def generate_class_code():

    is_existing = True
    quiz_repo = get_quiz_repository()

    while is_existing:
        class_code = "".join(random.choice(string.ascii_lowercase) for i in range(10))

        is_existing = bool(await quiz_repo.get_by_field("class_code", class_code))

    return class_code





