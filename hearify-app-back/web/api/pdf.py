import random
import string

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from schemas.user import UserDB
from api.dependencies import get_current_user
from tasks.tasks import generate_questions_from_pdf


router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/generate-pdf-questions")
async def generate_questions(
    file: UploadFile,
    end_page: int = 0,
    start_page: int = 0,
    number_of_question: int = 5,
    current_user: UserDB = Depends(get_current_user),
):
    if (
        start_page < 1
        or end_page < 1
        or start_page > end_page
        or number_of_question < 1
    ):
        raise HTTPException(status_code=400, detail="Wrong pages")

    file_content = await file.read()
    file_name = file.filename

    class_code = "".join(
        random.choice(string.ascii_lowercase) for i in range(10)
    )

    task = generate_questions_from_pdf.delay(
        file_content,
        file_name,
        start_page,
        end_page,
        number_of_question,
        str(current_user.id),
        class_code,
    )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }
