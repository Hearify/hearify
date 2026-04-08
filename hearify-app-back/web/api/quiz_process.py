import asyncio
import tempfile

import arrow
from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
import whisper

from api.dependencies import (
    QuestionRepository,
    QuizRepository,
    get_current_user,
    get_database,
    get_question_repository,
    get_quiz_process_repository,
    get_quiz_repository,
)
from ext.answers import get_empty_answer_record, is_answer_correct
from ext.check_access import check_any_access_quiz_db
from ext.open_questions import get_result_from_check_open_task, validate_open_question
from ext.pydantic_ext import PydanticObjectId
from repository.quiz_process import QuizProcessRepository
from schemas import quiz_processes, user
from schemas.quiz_processes import QuizProcessDTO
from schemas.quizzes import CheckOpenQuestionRequest

router = APIRouter()


@router.get("/{process_id}", response_model=QuizProcessDTO)
async def get_process_by_id(
    process_id: str,
    quiz_process_repo: QuizProcessRepository = Depends(get_quiz_process_repository),
):
    quiz_process = await quiz_process_repo.get_process_by_id(process_id)

    if not quiz_process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process with such id not found",
        )

    return quiz_process


@router.post("/{class_code}", response_model=quiz_processes.QuizProcessResponse)
async def start_quiz_process(
    class_code: str,
    questions_repo: QuestionRepository = Depends(get_question_repository),
    database=Depends(get_database),
    current_user: user.UserDB = Depends(get_current_user),
):
    quiz = await database["quizzes"].find_one({"class_code": class_code})

    if not quiz:
        raise HTTPException(
            detail="Quiz with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    process = await database["quiz_process"].find_one(
        {
            "class_code": class_code,
            "user_id": current_user.id,
            "is_submitted": True,
        }
    )

    if process:
        if not check_any_access_quiz_db(quiz=quiz, current_user_id=current_user.id):
            raise HTTPException(
                detail="You have already completed this quiz.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

    answers_tasks = [questions_repo.get_by_id(question_id) for question_id in quiz["questions"]]
    questions = await asyncio.gather(*answers_tasks)
    answers = [get_empty_answer_record(question) for question in questions]

    try:
        if quiz["is_special"]:
            result = await database["quiz_process"].insert_one(
                {
                    "user_id": current_user.id,
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
            "user_id": current_user.id,
            "class_code": class_code,
            "is_submitted": False,
            "is_public": False,
            "is_flashcard": True if quiz["settings"]["is_flashcard"] else False,
            "created_at": str(arrow.utcnow()),
            "questions": len(quiz["questions"]),
            "correct_answers": 0,
            "answers": answers,
        }
    )
    return {"class_code": class_code, "process_id": str(result.inserted_id)}


async def update_quiz_process(database, process_id, is_correct, answer_index, answer_record):
    update_data = {
        "$set": {f"answers.{answer_index}": answer_record},
        "$inc": {"correct_answers": 1 if is_correct else 0},
    }
    await database["quiz_process"].update_one({"_id": ObjectId(process_id)}, update_data)


@router.patch("/{process_id}/file")
async def answer_file_question(
    process_id: PydanticObjectId,
    question_id: PydanticObjectId,
    audio_file: UploadFile = File(...),
    database=Depends(get_database),
    question_repo: QuestionRepository = Depends(get_question_repository),
):
    quiz_process = await database["quiz_process"].find_one({"_id": process_id})
    if not quiz_process or quiz_process.get("is_submitted"):
        raise HTTPException(status_code=403, detail="No quiz found or it has been submitted.")

    current_question = await question_repo.get_by_id(str(question_id))
    if not current_question:
        raise HTTPException(status_code=404, detail="Question not found")

    if audio_file.content_type != "audio/mpeg":
        raise HTTPException(status_code=400, detail="Only MP3 files are allowed")

    try:
        if quiz_process["is_flashcard"]:
            if current_question.type == "fc_record_answer":
                model = whisper.load_model("base")
                with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as tmp_file:
                    contents = await audio_file.read()
                    tmp_file.write(contents)
                    tmp_file.flush()
                    result = model.transcribe(tmp_file.name)

                correct_answers = [ans.text for ans in current_question.answers if ans.correct]
                is_correct = is_answer_correct("fill_in", correct_answers, result["text"].strip())
                answer_record = {
                    "answer": result["text"],
                    "is_correct": is_correct,
                    "answered_at": str(arrow.utcnow()),
                    "question_text": current_question.question,
                }

                await update_quiz_process(
                    database,
                    process_id,
                    is_correct,
                    0,
                    answer_record,
                )

                return {
                    "is_correct": is_correct,
                    "process_id": str(process_id),
                    "correct_answer": correct_answers,
                }
    except KeyError:
        pass


@router.patch("/{process_id}")
async def answer_question(
    process_id: PydanticObjectId,
    request: quiz_processes.AnswerQuestionRequest,
    database=Depends(get_database),
    question_repo: QuestionRepository = Depends(get_question_repository),
):
    quiz_process = await database["quiz_process"].find_one({"_id": process_id})
    if not quiz_process or quiz_process.get("is_submitted"):
        raise HTTPException(status_code=403, detail="No quiz found or it has been submitted.")

    current_question = await question_repo.get_by_id(str(request.question_id))
    if not current_question:
        raise HTTPException(status_code=404, detail="Question not found")

    try:
        if quiz_process["is_special"]:
            result_data = []
            if current_question.type == "single_choice":
                for answer in current_question.answers:
                    if request.answer == answer.text:
                        point_counter = 1
                        for points in quiz_process["type_answers"]:
                            if point_counter in answer.points_to:
                                point = quiz_process["type_answers"][point_counter - 1]
                                for key in point:
                                    point[key] += 1
                                result_data.append(point)
                            else:
                                result_data.append(points)
                            point_counter += 1
                        break
                answer_record = {
                    "answer": request.answer,
                    "is_correct": True,
                    "answered_at": str(arrow.utcnow()),
                    "question_text": current_question.question,
                }
                await database["quiz_process"].update_one(
                    {"_id": ObjectId(process_id)},
                    {
                        "$set": {
                            "type_answers": result_data,
                            f"answers.{request.answer_index}": answer_record,
                        }
                    },
                )
                return current_question
            elif (
                current_question.type == "opened"
                or current_question.type == "special_single_choice"
            ):
                answer_record = {
                    "answer": request.answer,
                    "is_correct": True,
                    "answered_at": str(arrow.utcnow()),
                    "question_text": current_question.question,
                }
                await database["quiz_process"].update_one(
                    {"_id": ObjectId(process_id)},
                    {
                        "$set": {
                            f"answers.{request.answer_index}": answer_record,
                        }
                    },
                )
                return current_question
    except KeyError:
        pass

    try:
        if quiz_process["is_flashcard"]:
            if (
                current_question.type == "fc_fill_in"
                or current_question.type == "fc_translate"
                or current_question.type == "fc_enter_what_heard"
                or current_question.type == "fc_answer_picture"
                or current_question.type == "fc_key_concept"
            ):
                correct_answers = [ans.text for ans in current_question.answers if ans.correct]
                is_correct = is_answer_correct("fill_in", correct_answers, request.answer)
                answer_record = {
                    "answer": request.answer,
                    "is_correct": is_correct,
                    "answered_at": str(arrow.utcnow()),
                    "question_text": current_question.question,
                }

                await update_quiz_process(
                    database,
                    process_id,
                    is_correct,
                    request.answer_index,
                    answer_record,
                )

                return {
                    "is_correct": is_correct,
                    "process_id": str(process_id),
                    "correct_answer": correct_answers,
                }
    except KeyError:
        pass

    correct_answers = [ans.text for ans in current_question.answers if ans.correct]
    if current_question.type == "matching":
        correct_answers = [ans.correct for ans in current_question.answers]

    is_correct = is_answer_correct(current_question.type, correct_answers, request.answer)
    if current_question.type == "opened":
        open_answer_payload = CheckOpenQuestionRequest(
            **{
                "question_id": str(request.question_id),
                "answer": request.answer,
            }
        )
        checking_task = await validate_open_question(open_answer_payload)
        checking_result = await get_result_from_check_open_task(checking_task["task_id"])
        is_correct = bool(checking_result["result"])

    answer_record = {
        "answer": request.answer,
        "is_correct": is_correct,
        "answered_at": str(arrow.utcnow()),
        "question_text": current_question.question,
    }

    await update_quiz_process(database, process_id, is_correct, request.answer_index, answer_record)

    return {
        "is_correct": is_correct,
        "process_id": str(process_id),
        "correct_answer": correct_answers,
    }


@router.put("/{process_id}/submit")
async def submit_quiz_process(process_id: PydanticObjectId, database=Depends(get_database)):
    quiz_process = await database["quiz_process"].find_one({"_id": process_id})
    quiz = await database["quizzes"].find_one({"class_code": quiz_process["class_code"]})

    if not quiz_process or quiz_process["is_submitted"]:
        raise HTTPException(
            detail="Quiz process with such process_id was not found or the quiz has been submitted.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if quiz_process["user_id"] == quiz["user_id"]:
        await database["quiz_process"].update_one(
            {"_id": ObjectId(process_id)},
            {
                "$set": {
                    "is_submitted": True,
                    "is_owner": True,
                    "submitted_at": str(arrow.utcnow()),
                }
            },
        )
    else:
        await database["quiz_process"].update_one(
            {"_id": ObjectId(process_id)},
            {
                "$set": {
                    "is_submitted": True,
                    "is_owner": False,
                    "submitted_at": str(arrow.utcnow()),
                }
            },
        )

    return {"process_id": str(process_id)}
