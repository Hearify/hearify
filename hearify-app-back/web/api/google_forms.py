from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from api.dependencies import get_current_user, get_quiz_repository
from ext.google_forms.google_forms import create_google_form, save_form_on_client, get_credentials, get_authentication_url
from repository.quizzes import QuizRepository

router = APIRouter()

@router.get("/authorize")
async def get_oauth_credentials():
    """This endpoint provides oauth2 token with authorized sensitive scopes (Google forms)"""
    return get_authentication_url()

@router.post("/{class_code}")
async def export_quiz_to_google_forms(
        class_code: str,
        state: str,
        code: str,
        quiz_repo: QuizRepository = Depends(get_quiz_repository)
):
    creds = get_credentials(state=state, code=code)

    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            detail="Quiz with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    quiz = {**quiz.model_dump()}

    form_data = create_google_form(quiz=quiz)
    saving_result = save_form_on_client(creds=creds, form_data=form_data)

    if saving_result["ok"]:
        return {
            "status": 200,
            "detail": "Quiz was successfully saved on your google forms!"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong."
        )

