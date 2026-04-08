from datetime import datetime
from hashlib import md5
import json
from mimetypes import guess_extension
import os
from typing import List, Literal
from uuid import uuid4

import aiofiles
import arrow
from bson import ObjectId
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, JSONResponse

from api.dependencies import (
    QuestionRepository,
    QuizProcessRepository,
    QuizRepository,
    get_current_user,
    get_database,
    get_question_repository,
    get_quiz_process_repository,
    get_quiz_repository,
)
from core.config import FILES_STORAGE, IS_TEST_ENVIRONMENT
from ext.check_access import check_owner_access, check_owner_editor_access
from ext.pydantic_ext import PydanticObjectId
from schemas import mixins, quizzes, user

router = APIRouter()


@router.get("/my", response_model=mixins.ResponseItems[quizzes.QuizPublic])
async def get_all_my_quizzes(
    limit: int,
    skip: int,
    sort: Literal["asc", "desc"],
    current_user: user.UserDB = Depends(get_current_user),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
):
    """"""

    _quizzes = await quiz_repo.get_all(
        skip=skip,
        limit=limit,
        _filter={
            "$or": [
                {"user_id": current_user.id},
                {"members.owners": current_user.id},
                {"members.editors": current_user.id},
                {"members.viewers": current_user.id},
            ]
        },
        sort={
            "key_or_list": "created_at",
            "direction": {"asc": 1, "desc": -1}[sort],
        },
    )

    count = await quiz_repo.collection.count_documents({"user_id": current_user.id})

    return {"count": count, "data": _quizzes}


@router.get("/my/quizzes", response_model=mixins.ResponseItems[quizzes.QuizPublic])
async def get_all_my_only_quizzes(
    limit: int,
    skip: int,
    sort: Literal["asc", "desc"],
    current_user: user.UserDB = Depends(get_current_user),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
):
    """"""
    _quizzes = await quiz_repo.get_all(
        skip=skip,
        limit=limit,
        _filter={
            "$and": [
                {
                    "$or": [
                        {"settings.is_flashcard": False},
                        {"settings.is_flashcard": {"$exists": False}},
                    ]
                },
                {
                    "$or": [
                        {"user_id": current_user.id},
                        {"members.owners": current_user.id},
                        {"members.editors": current_user.id},
                        {"members.viewers": current_user.id},
                    ]
                },
            ],
        },
        sort={
            "key_or_list": "created_at",
            "direction": {"asc": 1, "desc": -1}[sort],
        },
    )

    count = await quiz_repo.collection.count_documents(
        {
            "user_id": current_user.id,
            "$or": [
                {"settings.is_flashcard": False},
                {"settings.is_flashcard": {"$exists": False}},
            ],
        }
    )

    return {"count": count, "data": _quizzes}


@router.get("/my/flashcards", response_model=mixins.ResponseItems[quizzes.QuizPublic])
async def get_all_my_only_flashcards(
    limit: int,
    skip: int,
    sort: Literal["asc", "desc"],
    current_user: user.UserDB = Depends(get_current_user),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
):
    """"""

    _quizzes = await quiz_repo.get_all(
        skip=skip,
        limit=limit,
        _filter={
            "$and": [
                {"settings.is_flashcard": True},
                {
                    "$or": [
                        {"user_id": current_user.id},
                        {"members.owners": current_user.id},
                        {"members.editors": current_user.id},
                        {"members.viewers": current_user.id},
                    ]
                },
            ],
        },
        sort={
            "key_or_list": "created_at",
            "direction": {"asc": 1, "desc": -1}[sort],
        },
    )

    count = await quiz_repo.collection.count_documents(
        {"user_id": current_user.id, "settings.is_flashcard": True}
    )

    return {"count": count, "data": _quizzes}


@router.get("/{class_code}", response_model=quizzes.QuizPublic)
async def get_quiz_by_class_code(
    class_code: str,
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
):
    """Returns the quiz by its class_code"""

    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            detail="Quiz with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # quiz.questions = await make_public(questions=quiz.questions)

    return quiz


@router.get("/{class_code}/users", response_model=mixins.ResponseItems[user.UserPublic])
async def get_users_from_quiz(
    class_code: str,
    database=Depends(get_database),
):
    """Returns all users who passed the quiz with certain 'class_code'"""

    user_ids = await database["quiz_process"].distinct("user_id", {"class_code": class_code})
    id_filter = {"_id": {"$in": [ObjectId(user_id) for user_id in user_ids]}}

    users = await database["users"].find(id_filter).to_list(length=None)
    count = await database["users"].count_documents(id_filter)

    return {"count": count, "data": users}


@router.get("/{class_code}/leaderboard")
async def get_quiz_leaderboard(
    class_code: str,
    limit: int = None,
    skip: int = 1,
    database=Depends(get_database),
    quiz_process_repo: QuizProcessRepository = Depends(get_quiz_process_repository),
):
    """Returns leaderboard of a quiz with certain 'class_code'"""

    quiz_participants_results = []
    quiz_results = await quiz_process_repo.get_distinct_processes_by_class_code(
        class_code, limit, skip
    )
    num_of_quizzes = len(quiz_results)

    if num_of_quizzes == 0:
        raise HTTPException(
            detail="Quiz with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    owners = []
    for result in quiz_results:
        if result["is_owner"]:
            question_user = await database["users"].find_one({"_id": ObjectId(result["user_id"])})
            if question_user:
                owners.append(
                    {
                        "user": {
                            "id": str(result["user_id"]),
                            "first_name": question_user["first_name"],
                            "surname": question_user["surname"],
                            "is_registered": True,
                        },
                        "questions": result["questions"],
                        "correct_answers": result["correct_answers"],
                        "is_owner": True,
                        "process_id": result["id"],
                    }
                )

        elif "user_id" in result and not result["is_owner"]:
            question_user = await database["users"].find_one({"_id": ObjectId(result["user_id"])})
            if question_user:
                quiz_participants_results.append(
                    {
                        "user": {
                            "id": str(result["user_id"]),
                            "first_name": question_user["first_name"],
                            "surname": question_user["surname"],
                            "is_registered": True,
                        },
                        "questions": result["questions"],
                        "correct_answers": result["correct_answers"],
                        "process_id": result["id"],
                    }
                )

        elif result["is_public"]:
            quiz_participants_results.append(
                {
                    "user": {
                        "id": result["id"],
                        "first_name": result["user_name"],
                        "surname": "",
                        "is_registered": False,
                    },
                    "questions": result["questions"],
                    "correct_answers": result["correct_answers"],
                    "process_id": result["id"],
                }
            )

    quiz_participants_results.extend(owners)
    return {"leaderboard": quiz_participants_results}


@router.patch("/{quiz_id}")
async def update_quiz_by_quiz_id(
    quiz_id: PydanticObjectId,
    files: List[UploadFile] | None = None,
    request_data: str = Form(...),
    current_user: user.UserDB = Depends(get_current_user),
    database=Depends(get_database),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
):
    """"""
    parsed_data = json.loads(request_data)
    data = quizzes.QuizUpdateRequest(**parsed_data)
    quiz = await quiz_repo.get_by_field(field="_id", value=quiz_id)

    if not check_owner_editor_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Operation forbidden")

    db_questions_map = {}
    for question in quiz.questions:
        db_questions_map[question.id] = question

    # DOMAIN LOGIC CHECKS (SHOULD BE TAKEN OUT TO SERVICES LAYER)
    if data.questions:
        for question_id, question in data.questions.items():
            db_question = db_questions_map[question_id]

            if question_id not in db_questions_map.keys():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quiz does not have question with id...",
                )

            if db_question.type == "single_choice":
                change_correct_answer = False
                # AT LEAST 2 ANSWERS
                # for answer in question.answers:
                #     if question.answers[answer].correct:
                #         change_answers = True
                #         break
                if change_correct_answer and len(question.answers) < 2:
                    raise HTTPException(
                        status_code=400,
                        detail="For Single Choice question type you should set previous true question to false explicitly",
                    )
                # TODO: cover cases when user makes incorrect answer to be false (in result two true answers)

            elif db_question.type == "multiple_choice":
                answers_number = len(db_questions_map[question_id].answers) - 1
                if question.answers and max(question.answers.keys()) > answers_number:
                    raise HTTPException(
                        status_code=400,
                        detail="Cannot cover more answers that question has, check your indices",
                    )

    pictures_ids = []
    if files:
        for file in files:
            content = await file.read()

            new_name = uuid4().hex
            content_type = (
                file.content_type if file.content_type is not None else "application/octet-stream"
            )
            file_ext = guess_extension(content_type) or "bin"
            file_path = os.path.join(FILES_STORAGE, f"{new_name}{file_ext}")

            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content)

            hash_value = md5(content).hexdigest()
            now_ = datetime.utcnow()
            new_picture = await database["files"].insert_one(
                {
                    "size": len(content),
                    "old_name": file.filename,
                    "content_type": file.content_type,
                    "file_name": f"{new_name}{file_ext}",
                    "file_path": file_path,
                    "hash": hash_value,
                    "created_at": now_,
                    "updated_at": now_,
                    "user_id": ObjectId(current_user.id),
                }
            )
            picture_id = new_picture.inserted_id
            pictures_ids.append(picture_id)

    # I am sorry and I apologize for this code, but i need a quick fix for production
    if (
        hasattr(quiz, "settings")
        and quiz.settings is not None
        and hasattr(quiz.settings, "breakpoints")
        and quiz.settings.breakpoints is not None
    ):
        counter = 0
        for breakpoint in data.settings.breakpoints:
            breakpoint.picture_id = pictures_ids[counter]
            counter += 1

    await quiz_repo.update_by_id(
        quiz_id=quiz_id,
        values=data.model_dump(
            by_alias=True,
            exclude_unset=True,
        ),
    )


@router.delete("/{quiz_id}")
async def delete_quiz_by_id(
    quiz_id: PydanticObjectId,
    current_user: user.UserDB = Depends(get_current_user),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
    question_repo: QuestionRepository = Depends(get_question_repository),
):
    """"""

    quiz = await quiz_repo.get_by_field(field="_id", value=quiz_id)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such id does not exist",
        )

    if not check_owner_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    await question_repo.delete_by_ids(
        question_ids=[str(question.id) for question in quiz.questions]
    )

    await quiz_repo.delete_by_id(quiz_id=quiz.id)

    return {"id": str(quiz.id)}


@router.delete("/{quiz_id}/questions/{question_id}")
async def delete_question_from_quiz(
    quiz_id: PydanticObjectId,
    question_id: PydanticObjectId,
    current_user: user.UserDB = Depends(get_current_user),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
    question_repo: QuestionRepository = Depends(get_question_repository),
):
    """Removes a question from the quiz with certain 'class_code'"""

    quiz = await quiz_repo.get_by_field(field="_id", value=quiz_id)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class-code does not exist",
        )

    if not check_owner_editor_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    question = next(
        (question for question in quiz.questions if question.id == ObjectId(question_id)),
        None,
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id={question_id} does not exist in such quiz",
        )

    await quiz_repo.delete_question(quiz_id=quiz.id, question_id=question_id)

    await question_repo.delete_by_ids(question_ids=[str(question_id)])

    return {"success": True}


@router.patch("/add-question/{question_type}/{class_code}")
async def add_question_to_quiz(
    question_type: str,
    class_code: str,
    question_repo: QuestionRepository = Depends(get_question_repository),
    quiz_repo: QuizRepository = Depends(get_quiz_repository),
    current_user: user.UserDB = Depends(get_current_user),
):
    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class-code does not exist",
        )

    if not check_owner_editor_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    try:
        new_question_id = await question_repo.create_empty(type_=question_type)
        update_result = await quiz_repo.add_question(
            class_code=class_code, question_id=new_question_id
        )

        if not update_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Something went wrong while trying to add question to quiz. But question was successfully created.",
            )

        return {"new_question_id": new_question_id}

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a correct question type",
        )


@router.get("/{class_code}/statistics")
async def get_quiz_statistics(
    class_code: str,
    database=Depends(get_database),
    quiz_process_repo: QuizProcessRepository = Depends(get_quiz_process_repository),
):
    quiz = await database["quizzes"].find_one({"class_code": class_code})

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found or you are not the owner of it.",
        )

    answered_questions_counter = 0
    correct_answers_counter = 0
    results = {}

    quiz_processes = await quiz_process_repo.get_distinct_processes_by_class_code(class_code)
    if not quiz_processes:
        raise HTTPException(
            status_code=status.HTTP_200_OK,
            detail="No student completed the quiz.",
        )

    number_of_students = len(quiz_processes)
    total_questions_counter = len(quiz["questions"])
    all_answers = []
    for process in quiz_processes:
        try:
            all_answers += process["answers"]
            for answer in all_answers:
                if answer["question_text"] not in results:
                    results[answer["question_text"]] = {
                        "question_text": answer["question_text"],
                        "overall_answers": 0,
                        "correct_answers": 0,
                    }

                results[answer["question_text"]]["overall_answers"] += 1
                results[answer["question_text"]]["correct_answers"] += (
                    1 if answer["is_correct"] else 0
                )

            for value in results.values():
                answered_questions_counter += value["overall_answers"]
                correct_answers_counter += value["correct_answers"]
        except KeyError:
            pass

    return {
        "quiz": {
            "created_at": quiz["created_at"],
            "total_number_of_students": number_of_students,
            "total_number_of_questions": total_questions_counter,
        },
        "average_quiz_result": {
            "number_of_answered_questions": answered_questions_counter,
            "number_of_correct_answers": correct_answers_counter,
        },
        "average_questions_results": {"results": list(results.values())},
    }


@router.get("/{class_code}/{user_id}/statistics")
async def get_user_quiz_statistics(class_code: str, user_id: str, database=Depends(get_database)):
    quiz = await database["quizzes"].find_one({"class_code": class_code})

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found or you are not the owner of it.",
        )

    quiz_processes = (
        await database["quiz_process"]
        .find(
            {
                "class_code": class_code,
                "is_submitted": True,
                "user_id": ObjectId(user_id),
            }
        )
        .to_list(length=None)
    )

    quiz_process = quiz_processes[-1]

    if not quiz_process:
        raise HTTPException(
            status_code=status.HTTP_200_OK,
            detail="Current student has not completed the quiz.",
        )

    completition_time = arrow.get(quiz_process["submitted_at"]) - arrow.get(
        quiz_process["created_at"]
    )

    answers = []
    for answer in quiz_process["answers"]:
        answers.append(answer)

    result_text = []
    result_picture_id = []
    result_description = []
    result_picture_path = []
    if "breakpoints" in quiz["settings"] and quiz["settings"]["breakpoints"] is not None:
        total_score = (quiz_process["correct_answers"] / quiz_process["questions"]) * 100
        for breakpoint in quiz["settings"]["breakpoints"]:
            if total_score >= breakpoint["min_score"] and total_score < breakpoint["max_score"]:
                result_text.append(breakpoint["message"])
                result_picture_id.append(breakpoint["picture_id"])
                result_description.append(breakpoint["description"])
                result_picture_path.append(
                    await get_picture_path(breakpoint["picture_id"], database)
                )

    return {
        "quiz_result": {
            "result_text": result_text[0] if result_text else None,
            "result_picture_id": (str(result_picture_id[0]) if result_picture_id else None),
            "result_description": (result_description[0] if result_description else None),
            "result_picture_path": (result_picture_path[0] if result_picture_path else None),
            "number_of_answered_questions": len(
                [answer for answer in quiz_process["answers"] if answer["answer"]]
            ),
            "number_of_correct_answers": quiz_process["correct_answers"],
            "number_of_incorrect_answers": quiz_process["questions"]
            - quiz_process["correct_answers"],
            "total_score": f'{quiz_process["correct_answers"]}/{quiz_process["questions"]}',
            "general_score": quiz_process["correct_answers"] / quiz_process["questions"],
            "time_spent": completition_time.seconds,
            "date_and_time": quiz_process["created_at"],
            "answers": answers,
        },
    }


@router.post("/{class_code}/picture")
async def quiz_upload_picture(
    is_preset: bool,
    class_code: str,
    preset_number: str | None = None,
    file: UploadFile | None = None,
    database=Depends(get_database),
    current_user: user.UserDB = Depends(get_current_user),
):
    quiz = await database["quizzes"].find_one({"class_code": class_code})

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found.",
        )
    if str(quiz["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this quiz.",
        )

    now_ = datetime.utcnow()

    if not file and is_preset:
        preset_file_path = os.path.join(f"{FILES_STORAGE}/presets", f"preset_{preset_number}.png")
        with open(preset_file_path, "rb") as f:
            preset_content = f.read()

        preset_hash_value = md5(preset_content).hexdigest()
        preset_new_picture = await database["files"].insert_one(
            {
                "size": len(preset_content),
                "old_name": f"preset_{preset_number}.png",
                "content_type": "application/octet-stream",
                "file_name": f"preset_{preset_number}.png",
                "file_path": preset_file_path,
                "hash": preset_hash_value,
                "created_at": now_,
                "updated_at": now_,
                "user_id": ObjectId(current_user.id),
            }
        )

        picture_id = preset_new_picture.inserted_id
        file_path = await get_picture_path(picture_id, database)

        await database["quizzes"].update_one(
            {"class_code": class_code},
            update={
                "$set": {
                    "picture_id": preset_new_picture.inserted_id,
                    "picture_path": file_path,
                }
            },
        )
        content = {"message": "success"}
        headers = {
            "Access-Control-Expose-Headers": "Picture-Id",
            "Picture-Id": str(preset_new_picture.inserted_id),
        }
        return JSONResponse(content=content, headers=headers)

    content = await file.read()

    new_name = uuid4().hex
    content_type = (
        file.content_type if file.content_type is not None else "application/octet-stream"
    )
    file_ext = guess_extension(content_type) or "bin"
    file_path = os.path.join(FILES_STORAGE, f"{new_name}{file_ext}")

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    hash_value = md5(content).hexdigest()

    new_picture = await database["files"].insert_one(
        {
            "size": len(content),
            "old_name": file.filename,
            "content_type": file.content_type,
            "file_name": f"{new_name}{file_ext}",
            "file_path": file_path,
            "hash": hash_value,
            "created_at": now_,
            "updated_at": now_,
            "user_id": ObjectId(current_user.id),
        }
    )

    picture_id = new_picture.inserted_id
    file_url = await get_picture_path(picture_id, database)

    await database["quizzes"].update_one(
        {"class_code": class_code},
        update={"$set": {"picture_id": new_picture.inserted_id, "picture_path": file_url}},
    )
    content = {"message": "success"}
    headers = {
        "Access-Control-Expose-Headers": "Picture-Id",
        "Picture-Id": str(new_picture.inserted_id),
    }
    return JSONResponse(content=content, headers=headers)


@router.post("/question/{question_id}/picture")
async def question_upload_picture(
    is_preset: bool,
    question_id: str,
    preset_number: str | None = None,
    file: UploadFile | None = None,
    database=Depends(get_database),
    current_user: user.UserDB = Depends(get_current_user),
):
    question = await database["questions"].find_one({"_id": ObjectId(question_id)})

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question with such id has not been found.",
        )

    now_ = datetime.utcnow()

    if not file and is_preset:
        preset_file_path = os.path.join(f"{FILES_STORAGE}/presets", f"preset_{preset_number}.png")
        with open(preset_file_path, "rb") as f:
            preset_content = f.read()

        preset_hash_value = md5(preset_content).hexdigest()
        preset_new_picture = await database["files"].insert_one(
            {
                "size": len(preset_content),
                "old_name": f"preset_{preset_number}.png",
                "content_type": "application/octet-stream",
                "file_name": f"preset_{preset_number}.png",
                "file_path": preset_file_path,
                "hash": preset_hash_value,
                "created_at": now_,
                "updated_at": now_,
                "user_id": ObjectId(current_user.id),
            }
        )

        picture_id = preset_new_picture.inserted_id
        file_path = await get_picture_path(picture_id, database)

        await database["questions"].update_one(
            {"_id": ObjectId(question_id)},
            update={
                "$set": {
                    "picture_id": preset_new_picture.inserted_id,
                    "picture_path": file_path,
                }
            },
        )
        content = {"message": "success"}
        headers = {
            "Access-Control-Expose-Headers": "Picture-Id",
            "Picture-Id": str(preset_new_picture.inserted_id),
        }
        return JSONResponse(content=content, headers=headers)

    content = await file.read()

    new_name = uuid4().hex
    content_type = (
        file.content_type if file.content_type is not None else "application/octet-stream"
    )
    file_ext = guess_extension(content_type) or "bin"
    file_path = os.path.join(FILES_STORAGE, f"{new_name}{file_ext}")

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    hash_value = md5(content).hexdigest()

    new_picture = await database["files"].insert_one(
        {
            "size": len(content),
            "old_name": file.filename,
            "content_type": file.content_type,
            "file_name": f"{new_name}{file_ext}",
            "file_path": file_path,
            "hash": hash_value,
            "created_at": now_,
            "updated_at": now_,
            "user_id": ObjectId(current_user.id),
        }
    )

    picture_id = new_picture.inserted_id
    file_url = await get_picture_path(picture_id, database)

    await database["questions"].update_one(
        {"_id": ObjectId(question_id)},
        update={"$set": {"picture_id": new_picture.inserted_id, "picture_path": file_url}},
    )
    content = {"message": "success"}
    headers = {
        "Access-Control-Expose-Headers": "Picture-Id",
        "Picture-Id": str(new_picture.inserted_id),
    }
    return JSONResponse(content=content, headers=headers)


async def get_picture_path(
    picture_id: str,
    database,
):
    file_record = await database["files"].find_one({"_id": ObjectId(picture_id)})
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


@router.get("/{picture_id}/picture")
async def get_picture(
    picture_id: str,
    database=Depends(get_database),
):
    file_record = await database["files"].find_one({"_id": ObjectId(picture_id)})

    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such file does not exist",
        )

    file_path = file_record["file_path"]

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such file does not exist",
        )

    return FileResponse(file_path)


@router.delete("/{class_code}/picture")
async def remove_quiz_picture(
    class_code: str,
    database=Depends(get_database),
    current_user: user.UserDB = Depends(get_current_user),
):
    quiz = await database["quizzes"].find_one({"class_code": class_code})

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found.",
        )

    if str(quiz["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this quiz.",
        )

    await database["files"].delete_one({"_id": ObjectId(quiz["picture_id"])})

    await database["quizzes"].update_one(
        {"class_code": class_code}, {"$set": {"picture_id": None, "picture_path": None}}
    )

    return {"message": "success"}


@router.delete("/question/{question_id}/picture")
async def remove_question_picture(
    question_id: str,
    database=Depends(get_database),
    current_user: user.UserDB = Depends(get_current_user),
):
    question = await database["questions"].find_one({"_id": ObjectId(question_id)})

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question with such id has not been found.",
        )

    await database["files"].delete_one({"_id": ObjectId(question["picture_id"])})
    await database["questions"].update_one(
        {"_id": ObjectId(question_id)}, {"$set": {"picture_id": None, "picture_path": None}}
    )

    return {"message": "success"}


@router.get("/{class_code}/{process_id}/startup_type")
async def get_user_startup_type(
    class_code: str,
    process_id: PydanticObjectId,
    database=Depends(get_database),
):
    quiz = await database["quizzes"].find_one({"class_code": class_code})
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found or you are not the owner of it.",
        )

    quiz_process = await database["quiz_process"].find_one({"_id": process_id})

    if not quiz_process:
        raise HTTPException(
            status_code=status.HTTP_200_OK,
            detail="Current student has not completed the quiz.",
        )

    final_type = {}
    type_number = 0
    for answer_type in quiz_process["type_answers"]:
        for key in answer_type:
            if answer_type[key] > type_number:
                for key, values in answer_type.items():
                    final_type = key
                type_number = answer_type[key]

    final_type_path = ""
    if final_type == "type_one_answers":
        final_type_path = "../files/startup_types/hustler.png"
    elif final_type == "type_two_answers":
        final_type_path = "../files/startup_types/dreamer.png"
    elif final_type == "type_three_answers":
        final_type_path = "../files/startup_types/connector.png"
    elif final_type == "type_four_answers":
        final_type_path = "../files/startup_types/mentor.png"
    elif final_type == "type_five_answers":
        final_type_path = "../files/startup_types/manager.png"
    elif final_type == "type_six_answers":
        final_type_path = "../files/startup_types/planner.png"
    elif final_type == "type_seven_answers":
        final_type_path = "../files/startup_types/cheat_code_owner.png"

    if not os.path.exists(final_type_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such file does not exist",
        )
    return FileResponse(final_type_path)
