import re
import random
import string

from fastapi import APIRouter, Depends, HTTPException

from schemas.user import UserDB
from api.dependencies import get_current_user
from tasks.tasks import generate_youtube_questions_task
from utils import generate_class_code

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/generate-youtube-questions")
async def generate_youtube_questions(
    url: str,
    number_of_questions: int = 5,
    current_user: UserDB = Depends(get_current_user),
):
    if number_of_questions < 1:
        raise HTTPException(status_code=400, detail="Wrong number of questions")

    youtube_pattern = re.compile(
        r"^https://www\.youtube\.com/watch\?v=[a-zA-Z0-9_-]{11}$"
    )
    if not youtube_pattern.match(url):
        raise HTTPException(status_code=400, detail="Wrong url")

    class_code = await generate_class_code()

    task = generate_youtube_questions_task.delay(
        url,
        number_of_questions,
        class_code,
        str(current_user.id),
    )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }
