import os
from bson import ObjectId
from fastapi import APIRouter, status, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse

from schemas.user import UserDB
from schemas.questions import QuestionDB, QuestionUpdate
from api.dependencies import (
    get_question_repository,
    QuestionRepository,
    get_current_user,
)

from gtts import gTTS


router = APIRouter(dependencies=[Depends(get_current_user)])


def delete_file(file_path: str):
    """Delete the MP3 file after response is sent."""
    if os.path.exists(file_path):
        os.remove(file_path)


@router.get(
    "/{question_id}",
    response_model=QuestionDB,
)
async def get_by_id(
    question_id: str,
    background_tasks: BackgroundTasks,
    question_repo: QuestionRepository = Depends(get_question_repository),
):
    """"""

    question = await question_repo.get_by_field(
        field="_id", value=ObjectId(question_id)
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question with such id has not been found",
        )

    if question.type == "fc_enter_what_heard":
        tts = gTTS(question.answers[0].text, lang="en")
        filename = "output.mp3"
        tts.save(filename)
        background_tasks.add_task(delete_file, filename)
        return FileResponse(
            filename, media_type="audio/mpeg", filename="speech.mp3"
        )
    return question


@router.patch(
    "/{question_id}",
    response_model=QuestionDB,
)
async def update_question(
    question_id: str,
    payload: QuestionUpdate,
    current_user: UserDB = Depends(get_current_user),
    question_repo: QuestionRepository = Depends(get_question_repository),
):
    """"""

    users_ids = await question_repo.get_user_ids(question_id=question_id)

    if current_user.id not in users_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    updated = await question_repo.update(
        question_id=ObjectId(question_id),
        payload=payload.model_dump(exclude_unset=True),
    )

    return updated
