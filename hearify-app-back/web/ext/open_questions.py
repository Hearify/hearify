from http.client import HTTPException
from celery.result import AsyncResult

from api.dependencies import get_question_repository
from schemas import quizzes
from tasks.tasks import check_open_question


async def validate_open_question(
        request: quizzes.CheckOpenQuestionRequest
):
    question_repo = get_question_repository()

    if not request.question_id or not request.answer:
        raise HTTPException(
            status_code=400, detail="Question or answer is missing."
        )

    quiz_question = await question_repo.get_by_id(request.question_id)

    if not quiz_question or not quiz_question.answers:
        raise HTTPException(
            status_code=404, detail="Question not found or missing answers."
        )

    correct_answer = dict(quiz_question.answers[0])["text"]

    task = check_open_question.delay(
        question=quiz_question.question,
        correct_answer=correct_answer,
        user_answer=request.answer,
        model_name="gpt-3.5-turbo-0125"
    )

    return {"task_id": task.id}

async def check_open_question_result(task_id: str):
    task_result = AsyncResult(task_id)

    if task_result.state == 'PENDING':
        return {"status": "pending"}
    elif task_result.state != 'FAILURE':
        return {"status": "completed", "result": task_result.result}
    else:
        return {"status": "failed", "result": task_result.result}


async def get_result_from_check_open_task(task_id: str):
    while True:
        result = await check_open_question_result(task_id)

        if result.get("result") in (0, 1):
            break
        else:
            continue

    return result