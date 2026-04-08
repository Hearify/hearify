from datetime import timedelta
import hashlib
import logging
import re

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from api.dependencies import get_current_user, get_database, get_user_repository
from core import config
from ml_service.gpt.gpt_handlers import (
    FileGptHandler,
    TextGptHandler,
    YoutubeGptHandler,
)
from repository.users import UserRepository
from schemas.questions import (
    FileGenerationRequest,
    TextQuestionGenerationRequest,
    TextRoadmapGenerationRequest,
    TopicRoadmapGenerationRequest,
    YouTubeQuestionGenerationRequest,
    YouTubeRoadmapGenerationRequest,
    FileRoadmapGenerationRequest,
)
from schemas.user import UserDB
from tasks.tasks import (
    generate_questions_from_file,
    generate_questions_from_text,
    generate_roadmap_from_text,
    generate_subtopic_from_topic,
    generate_roadmap_from_file,
    generate_roadmap_from_youtube,
    regenerate_subtopics,
    worker,
)
from tasks.tasks import (
    generate_youtube_questions_task,
)  # generate_questions_pipeline
from utils import generate_class_code

# Configure logging
# logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn.error")


router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/generate-file-questions")
async def generate_file_questions(
    request: FileGenerationRequest,
    file: UploadFile,
    current_user: UserDB = Depends(get_current_user),
    users_repo: UserRepository = Depends(get_user_repository),
):

    # Validate file type
    if not (file.filename.endswith(".docx") or file.filename.endswith(".pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only .pdf and .docx files are allowed.",
        )

    question_types = [model.model_dump() for model in request.question_types]
    num_questions = sum(
        question["number_of_questions"] for question in question_types
    )

    # Check does the user have enough credits
    await validate_user_access(current_user, num_questions, users_repo)

    if request.start_page:
        request.start_page = max(0, request.start_page - 1)

    file_content = file.file.read()
    file_hash = hashlib.md5(file_content).hexdigest()

    file_handler = FileGptHandler()

    if file.filename.endswith(".pdf"):

        if request.has_tables and request.start_page and request.end_page:
            file_text = file_handler.extract_tables(
                file_content, request.start_page, request.end_page
            )

        elif request.start_page and request.end_page:
            file_text = file_handler.extract_text_from_pdf(
                file_content,
                request.start_page,
                request.end_page,
                request.language,
            )
        else:
            file_text = file_handler.extract_split_paragraphs(
                file_content, num_questions, request.language
            )

    if file.filename.endswith(".docx"):
        file_text = file_handler.extract_text_from_docx(
            file_content, num_questions, request.language
        )

    await file_handler.validate_text(file_text, current_user)

    class_code = await generate_class_code()

    generation_payload = {
        "generated_by": "pdf",
        "file_name": file.filename,
        "pdf_md5_hash": file_hash,
    }

    # task = generate_questions_pipeline.delay
    if request:
        task = generate_questions_from_file.delay(
            pdf_text=file_text,
            generation_payload=generation_payload,
            user_id=str(current_user.id),
            class_code=class_code,
            language=request.language,
            difficulty=request.difficulty,
            additional_prompt=request.additional_prompt,
            model_name=file_handler.choose_gpt_model_name(current_user),
            settings=get_settings(request),
            question_types=question_types,
            dynamic_types_request=request.dynamic_types_request,
        )

    await users_repo.update_user(
        user_id=current_user.id,
        payload={"credits": current_user.credits - num_questions},
    )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }


@router.get("/statuses/{task_id}", tags=["statuses"])
async def get_task_status(task_id: str):
    """"""

    task = generate_questions_from_file.AsyncResult(task_id, app=worker)

    return {"state": task.state}


def get_youtube_handler() -> YoutubeGptHandler:
    return YoutubeGptHandler()


@router.post("/generate-youtube-questions")
async def generate_youtube_questions(
    request: YouTubeQuestionGenerationRequest,
    current_user: UserDB = Depends(get_current_user),
    users_repo: UserRepository = Depends(get_user_repository),
    youtube_handler: YoutubeGptHandler = Depends(get_youtube_handler),
):
    question_types = [model.model_dump() for model in request.question_types]
    num_questions = sum(
        question["number_of_questions"] for question in question_types
    )

    # Check does the user have enough credits
    await validate_user_access(current_user, num_questions, users_repo)
    logger.warning("User access validated")

    # Check time format
    if request.start_time or request.end_time:
        start_timestamp = parse_time(request.start_time)
        end_timestamp = parse_time(request.end_time)

    if (
        start_timestamp != timedelta(seconds=0)
        and start_timestamp > end_timestamp
    ):
        raise HTTPException(
            status_code=400,
            detail={"error": "Start time cannot be greater than end time"},
        )

    # Check youtube link
    video_url = validate_youtube_link(request.url)
    video_id = video_url[-11:]
    logger.warning("Validated YouTube link, video ID: %s", video_id)

    sub_text, _ = await youtube_handler.extract_subs(
        video_id, start_timestamp, end_timestamp, num_questions
    )
    # youtube_handler.validate_text(sub_text, current_user, minute_length)

    class_code = await generate_class_code()

    task = generate_youtube_questions_task.delay(
        text=sub_text,
        url=request.url,
        language=request.language,
        difficulty=request.difficulty,
        additional_prompt=request.additional_prompt,
        user_id=str(current_user.id),
        class_code=class_code,
        model_name=youtube_handler.choose_gpt_model_name(current_user),
        settings=get_settings(request),
        question_types=question_types,
    )

    logger.warning("Task created with ID: %s", task.id)

    # Update user credits
    await users_repo.update_user(
        user_id=current_user.id, payload={"credits": current_user.credits - 1}
    )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }


@router.post("/get-youtube-timecodes")
async def get_youtube_timecodes(
    url: str,
    youtube_handler: YoutubeGptHandler = Depends(get_youtube_handler),
):
    validate_youtube_link(url)
    video_id = url[-11:]
    time_codes = await youtube_handler.get_video_duration(video_id)

    return time_codes


@router.post("/generate-text-questions")
async def generate_questions(
    request: TextQuestionGenerationRequest,
    current_user: UserDB = Depends(get_current_user),
    users_repo: UserRepository = Depends(get_user_repository),
):

    question_types = [model.model_dump() for model in request.question_types]
    num_questions = sum(
        question["number_of_questions"] for question in question_types
    )

    # Check does the user have enough credits
    await validate_user_access(current_user, num_questions, users_repo)

    text_handler = TextGptHandler()
    await text_handler.validate_text(request.text, current_user)

    class_code = await generate_class_code()
    task = generate_questions_from_text.delay(
        text=request.text,
        language=request.language,
        difficulty=request.difficulty,
        additional_prompt=request.additional_prompt,
        user_id=str(current_user.id),
        class_code=class_code,
        model_name=text_handler.choose_gpt_model_name(current_user),
        settings=get_settings(request),
        question_types=question_types,
    )

    await users_repo.update_user(
        user_id=current_user.id, payload={"credits": current_user.credits - 1}
    )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }


def validate_youtube_link(url: str):
    youtube_pattern = re.compile(
        r"^https://www\.youtube\.com/watch\?v=[a-zA-Z0-9_-]{11}"
    )
    youtu_pattern = re.compile(r"^https://youtu\.be/[a-zA-Z0-9_-]{11}")
    if youtube_pattern.match(url):
        url = url[:43]
        return url
    elif youtu_pattern.match(url):
        url = url[:28]
        return url
    else:
        raise HTTPException(status_code=400, detail={"error": "Wrong url"})


def parse_time(time_str):
    try:
        h, m, s = map(int, time_str.split(":"))
        if h < 0 or m < 0 or s < 0:
            raise HTTPException(
                status_code=400,
                detail={"error": "Time components cannot be negative"},
            )
        return timedelta(hours=h, minutes=m, seconds=s)
    except ValueError:
        raise HTTPException(
            status_code=400, detail={"error": "Incorrect time format"}
        )


def get_settings(request):
    return {**request.settings.model_dump()} if request.settings else {}


async def validate_user_access(
    current_user, total_questions, users_repo
) -> None:
    # In test environment skip all credit/subscription checks
    if config.IS_TEST_ENVIRONMENT:
        return

    user_subscription = await users_repo.get_user_subscription(
        current_user.subscription_id
    )
    credits = current_user.credits or 0
    credit_subscriptions = ["Free", "Basic", "Premium"]

    if user_subscription in credit_subscriptions:
        if credits - total_questions < 0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough credits.",
            )
        if user_subscription == "Free" and total_questions > 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your limit is 5 questions.",
            )
        elif user_subscription == "Basic" and total_questions > 10:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your limit is 10 questions.",
            )
        elif user_subscription == "Premium" and total_questions > 30:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your limit is 30 questions.",
            )
    elif user_subscription == "Max":
        await users_repo.update_user(
            user_id=current_user.id, payload={"credits": total_questions}
        )


@router.post("/generate-text-roadmap")
async def generate_text_roadmap(
    request: TextRoadmapGenerationRequest,
    current_user: UserDB = Depends(get_current_user),
    users_repo: UserRepository = Depends(get_user_repository),
):
    # Check does the user have enough credits
    # await validate_user_access(current_user, num_questions, users_repo)

    text_handler = TextGptHandler()
    await text_handler.validate_roadmap_text(request.text, current_user)

    class_code = await generate_class_code()

    task = generate_roadmap_from_text.delay(
        text=request.text,
        language=request.language,
        user_id=str(current_user.id),
        class_code=class_code,
        model_name=text_handler.choose_gpt_model_name(current_user),
    )

    # await users_repo.update_user(
    #     user_id=current_user.id, payload={"credits": current_user.credits - 1}
    # )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }


@router.post("/generate-file-roadmap")
async def generate_file_roadmap(
        request: FileRoadmapGenerationRequest,
        file: UploadFile,
        current_user: UserDB = Depends(get_current_user),
        users_repo: UserRepository = Depends(get_user_repository),
):
    # Validate file type
    if not (file.filename.endswith(".docx") or file.filename.endswith(".pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only .pdf and .docx files are allowed.",
        )

    # Check does the user have enough credits
    # await validate_user_access(current_user, num_questions, users_repo)

    if request.start_page:
        request.start_page = max(0, request.start_page - 1)

    file_content = file.file.read()
    file_hash = hashlib.md5(file_content).hexdigest()
    file_handler = FileGptHandler()

    if file.filename.endswith(".pdf"):
        if request.has_tables and request.start_page and request.end_page:
            file_text = file_handler.extract_tables(
                file_content, request.start_page, request.end_page
            )
        elif request.start_page and request.end_page:
            file_text = file_handler.extract_text_from_pdf(
                file_content,
                request.start_page,
                request.end_page,
                request.language,
            )
        else:
            file_text = file_handler.extract_split_paragraphs(
                file_content, 1000, request.language
            )

    if file.filename.endswith(".docx"):
        file_text = file_handler.extract_text_from_docx(
            file_content, 1000, request.language
        )

    file_handler.validate_text_roadmap(file_text, current_user)

    class_code = await generate_class_code()

    generation_payload = {
        "generated_by": "pdf",
        "file_name": file.filename,
        "pdf_md5_hash": file_hash,
    }

    if request:
        task = generate_roadmap_from_file.delay(
            pdf_text=file_text,
            generation_payload=generation_payload,
            user_id=str(current_user.id),
            class_code=class_code,
            language=request.language,
            model_name=file_handler.choose_gpt_model_name(current_user),
        )

    # Decrease user's credits
    # await users_repo.update_user(
    #     user_id=current_user.id,
    #     payload={"credits": current_user.credits - num_questions},
    # )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }


@router.post("/generate-youtube-roadmap")
async def generate_youtube_roadmap(
        request: YouTubeRoadmapGenerationRequest,
        current_user: UserDB = Depends(get_current_user),
        users_repo: UserRepository = Depends(get_user_repository),
        youtube_handler: YoutubeGptHandler = Depends(get_youtube_handler),
):
    # Check does the user have enough credits
    # await validate_user_access(current_user, ..., users_repo)
    # logger.warning("User access validated")

    # Check time format
    if request.start_time or request.end_time:
        start_timestamp = parse_time(request.start_time)
        end_timestamp = parse_time(request.end_time)

    if (
        start_timestamp != timedelta(seconds=0)
        and start_timestamp > end_timestamp
    ):
        raise HTTPException(
            status_code=400,
            detail={"error": "Start time cannot be greater than end time"},
        )

    # Check youtube link
    video_url = validate_youtube_link(request.url)
    video_id = video_url[-11:]
    logger.warning("Validated YouTube link, video ID: %s", video_id)

    sub_text, _ = await youtube_handler.extract_subs(
        video_id, start_timestamp, end_timestamp, 1000
    )

    class_code = await generate_class_code()

    task = generate_roadmap_from_youtube.delay(
        text=sub_text,
        url=request.url,
        language=request.language,
        user_id=str(current_user.id),
        class_code=class_code,
        model_name=youtube_handler.choose_gpt_model_name(current_user),
    )

    # Update user credits
    # await users_repo.update_user(
    #     user_id=current_user.id, payload={"credits": current_user.credits - 1}
    # )

    return {
        "task_id": task.id,
        "class_code": class_code,
    }


async def generate_subtopic_roadmap(
        request: TopicRoadmapGenerationRequest,
        class_code: str,
        current_user: UserDB = Depends(get_current_user),
):
    text_handler = TextGptHandler()

    i = 1
    subtopics = ""
    for subtopic_req in request["subtopics"]:
        if i == len(request["subtopics"]):
            subtopics += subtopic_req["name"] + ""
        else:
            subtopics += subtopic_req["name"] + ", "
        i+=1

    task = generate_subtopic_from_topic.delay(
        topic_name=request["topic"],
        subtopics=subtopics,
        language=request["language"],
        class_code=class_code,
        model_name=text_handler.choose_gpt_model_name(current_user),
    )

    return task.id


async def regenerate_subtopics_roadmap(
        topic_name: str,
        language: str,
        class_code: str,
        current_user: UserDB = Depends(get_current_user),
):
    text_handler = TextGptHandler()
    task = regenerate_subtopics.delay(
        topic_name=topic_name,
        language=language,
        class_code=class_code,
        model_name=text_handler.choose_gpt_model_name(current_user),
    )

    return task.id
