import asyncio

import arrow
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from core.config import IS_TEST_ENVIRONMENT
from api.dependencies import get_quiz_repository, get_database, get_question_repository
from ext.answers import get_empty_answer_record
from ext.pydantic_ext import PydanticObjectId
from repository.questions import QuestionRepository
from repository.quizzes import QuizRepository
from schemas import quizzes, quiz_processes

router = APIRouter()

@router.get("/{class_code}/is_public/")
async def get_is_public_quiz(
        class_code: str,
        quiz_repo: QuizRepository = Depends(get_quiz_repository),
):
    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found.",
        )

    return quiz.settings.is_public


@router.get("/quizzes/{class_code}", response_model=quizzes.QuizPublic)
async def get_public_quiz_by_class_code(
        class_code: str,
        quiz_repo: QuizRepository = Depends(get_quiz_repository),
):

    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            detail="Quiz with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return quiz


@router.post(
    "/quiz-process/{class_code}/{user_name}",
    response_model=quiz_processes.QuizProcessResponse
)
async def start_public_quiz_process(
        class_code: str,
        user_name: str,
        questions_repo: QuestionRepository = Depends(get_question_repository),
        database=Depends(get_database),
):
    quiz = await database['quizzes'].find_one({"class_code": class_code})

    if not quiz:
        raise HTTPException(
            detail="Quiz with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    answers_tasks = [questions_repo.get_by_id(question_id) for question_id in quiz['questions']]
    questions = await asyncio.gather(*answers_tasks)
    answers = [get_empty_answer_record(question) for question in questions]

    try:
        if quiz["is_special"]:
            result = await database["quiz_process"].insert_one(
                {
                    "user_name": user_name,
                    "class_code": class_code,
                    "is_submitted": False,
                    "is_public": False,
                    "created_at": str(arrow.utcnow()),
                    "questions": len(quiz["questions"]),
                    "type_answers": [
                        {"type_one_answers": 0},
                        {"type_two_answers": 0},
                        {"type_three_answers": 0},
                        {"type_four_answers": 0},
                        {"type_five_answers": 0},
                        {"type_six_answers": 0},
                        {"type_seven_answers": 0},
                    ],
                    "correct_answers": 0,
                    "answers": answers,
                    "is_special": True,
                }
            )
            return {
                "class_code": class_code,
                "process_id": str(result.inserted_id),
            }
    except KeyError:
        pass

    result = await database["quiz_process"].insert_one(
        {
            "user_name": user_name,
            "class_code": class_code,
            "is_submitted": False,
            "is_public": True,
            "created_at": str(arrow.utcnow()),
            "questions": len(quiz['questions']),
            "correct_answers": 0,
            "answers": answers
        }
    )

    return {
        "class_code": class_code,
        "process_id": str(result.inserted_id)
    }

@router.put("/quiz-process/{process_id}/submit")
async def submit_public_quiz_process(
        process_id: PydanticObjectId,
        database=Depends(get_database)
):
    quiz_process = await database['quiz_process'].find_one({"_id": process_id})

    if not quiz_process or quiz_process["is_submitted"]:
        raise HTTPException(
            detail="Quiz process with such process_id was not found or the quiz has been submitted.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    await database["quiz_process"].update_one(
        {"_id": ObjectId(process_id)},
        {
            "$set": {
                "is_submitted": True,
                "is_owner": False,
                "submitted_at": str(arrow.utcnow())
            }
        }
    )

    return {"process_id": str(process_id)}


@router.get("/{class_code}/{process_id}/statistics")
async def get_user_public_quiz_statistics(
        class_code: str,
        process_id: str,
        database=Depends(get_database),
):
    quiz = await database["quizzes"].find_one(
        {"class_code": class_code}
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found or you are not the owner of it.",
        )

    quiz_process = await database["quiz_process"].find_one({"_id": ObjectId(process_id)})

    if not quiz_process:
        raise HTTPException(
            status_code=status.HTTP_200_OK, detail="Current student has not completed the quiz."
        )

    completition_time = arrow.get(quiz_process["created_at"]) - arrow.get(quiz_process["submitted_at"])

    answers = []
    for answer in quiz_process["answers"]:
        answers.append(answer)

    result_text = []
    result_picture_id = []
    result_description = []
    result_picture_path = []
    if "breakpoints" in quiz["settings"] and quiz["settings"]["breakpoints"] is not None:
        total_score = (
            quiz_process["correct_answers"] / quiz_process["questions"]
        ) * 100
        for breakpoint in quiz["settings"]["breakpoints"]:
            if (
                total_score >= breakpoint["min_score"]
                and total_score < breakpoint["max_score"]
            ):
                result_text.append(breakpoint["message"])
                result_picture_id.append(breakpoint["picture_id"])
                result_description.append(breakpoint["description"])
                result_picture_path.append(
                    await get_picture_path(breakpoint["picture_id"], database)
                )

    return {
        "quiz_result": {
            "result_text": result_text[0] if result_text else None,
            "result_picture_id": str(result_picture_id[0]) if result_picture_id else None,
            "result_description": result_description[0] if result_description else None,
            "result_picture_path": result_picture_path[0] if result_picture_path else None,
            "number_of_answered_questions": len([answer for answer in quiz_process["answers"] if answer["answer"]]),
            "number_of_correct_answers": quiz_process["correct_answers"],
            "number_of_incorrect_answers": quiz_process["questions"] - quiz_process["correct_answers"],
            "total_score": f'{quiz_process["correct_answers"]}/{quiz_process["questions"]}',
            "general_score": quiz_process["correct_answers"] / quiz_process["questions"],
            "time_spent": completition_time.seconds / 1000,
            "date_and_time": quiz_process["created_at"],
            "answers": answers
        },
    }


async def get_picture_path(
    picture_id: str,
    database,
):
    file_record = await database["files"].find_one(
        {"_id": ObjectId(picture_id)}
    )
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such file does not exist",
        )
    file_name = file_record["file_name"]

    if IS_TEST_ENVIRONMENT:
        file_path = f"https://test.hearify.org/api/files/{file_name}"
    else:
        file_path = f"https://api.hearify.org/api/files/{file_name}"

    return file_path
