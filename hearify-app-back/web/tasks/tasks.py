import asyncio
import concurrent.futures
import json
import time

from celery import Celery

from core import config


worker = Celery(
    broker=config.CELERY_BROKER_URL, backend=config.CELERY_BACKEND_URL
)

worker.conf.result_expires = 30 * 60

from db.database import get_db
from ext.functions import send_email
from helpers.helpers import remove_extra_questions
from ml_service.gpt.gpt_handlers import GptHandler
from ml_service.gpt.prompts import (
    CheckOpenQuestion,
    DynamicTypesQuestionTemplate,
    MultipleTypesQuestionTemplate,
    format_fill_in_questions,
    get_prompt,
    multiple_format_fill_in_questions,
    type_prompt_mapper,
    roadmap_type_prompt_mapper,
    new_subtopic_prompt_mapper,
    regenerated_subtopics_prompt_mapper,
)
from schemas.quizzes import GeneratedQuiz, GeneratedRoadmap
from tasks.async_tasks import generate_quiz, generate_roadmap, add_new_subtopic, regenerate_subtopics_task
from tasks.utils import save_generation_info

# Parallelize PDF generation when text exceeds this length
_PARALLEL_CHUNK_THRESHOLD = 5000
_MAX_PARALLEL_CHUNKS = 3


def _build_quiz_prompt(question_types, text, language, difficulty, additional_prompt, dynamic_types_request, multiple_types_request):
    if dynamic_types_request:
        return DynamicTypesQuestionTemplate().build_dynamic_types(
            question_types, text=text, language=language,
            difficulty=difficulty, additional_prompt=additional_prompt,
        ), multiple_types_request
    if len(question_types) == 1:
        return type_prompt_mapper(question_types[0]["name"]).build(
            text=text,
            questions_num=question_types[0]["number_of_questions"],
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        ), False
    return MultipleTypesQuestionTemplate().build(
        question_types, text=text, language=language,
        difficulty=difficulty, additional_prompt=additional_prompt,
    ), True


def _format_quiz(raw, multiple_types_request):
    return multiple_format_fill_in_questions(raw) if multiple_types_request else format_fill_in_questions(raw)


@worker.task
def task_send_email(recipients: list[str], subject: str, body: str):
    """"""
    send_email(recipients=recipients, subject=subject, body=body)


@worker.task
def generate_questions_pipeline(
    text: str,
    generation_payload: dict,
    user_id: str,
    class_code: str,
    language: str | None,
    difficulty: str | None,
    additional_prompt: str | None,
    model_name: str,
    settings: dict | None,
    question_types: list[dict] | None,
    dynamic_types_request: str | None,
):
    gpt_handler = GptHandler()
    prompt, multiple_types_request = get_prompt(
        dynamic_types_request,
        language,
        difficulty,
        additional_prompt,
        text,
        question_types,
    )
    quiz = gpt_handler.json_request(prompt, model_name)
    quiz = (
        multiple_format_fill_in_questions(quiz)
        if multiple_types_request
        else format_fill_in_questions(quiz)
    )
    quiz = remove_extra_questions(quiz, question_types)
    print(f"Number of generated quizzes: {len(quiz['questions'])}")
    print(f"Generated quiz from pdf: {quiz}")

    validated_quiz = GeneratedQuiz.model_validate(quiz)
    asyncio.run(
        generate_quiz(
            user_id=user_id,
            database=get_db(),
            quiz=validated_quiz,
            class_code=class_code,
            settings=settings,
            generation_payload=generation_payload,
        )
    )


@worker.task
def generate_questions_from_file(
    pdf_text: str,
    generation_payload: dict,
    user_id: str,
    class_code: str,
    language: str | None,
    difficulty: str | None,
    additional_prompt: str | None,
    model_name: str,
    settings: dict | None,
    question_types: list[dict] | None,
    dynamic_types_request: str | None,
):
    database = get_db()
    multiple_types_request = False
    dynamic_types_request = dynamic_types_request == "dynamic"

    total_questions = sum(qt["number_of_questions"] for qt in question_types)
    start = time.time()

    try:
        # C: parallel chunk generation for large texts (single/multi type only, not dynamic)
        if (
            not dynamic_types_request
            and len(pdf_text) > _PARALLEL_CHUNK_THRESHOLD
        ):
            chunk_size = len(pdf_text) // _MAX_PARALLEL_CHUNKS
            chunks = [
                pdf_text[i: i + chunk_size]
                for i in range(0, len(pdf_text), chunk_size)
            ][: _MAX_PARALLEL_CHUNKS]

            per_chunk = max(1, total_questions // len(chunks))
            chunk_question_types = [
                {**qt, "number_of_questions": per_chunk} for qt in question_types
            ]

            prompts = []
            for chunk in chunks:
                p, multiple_types_request = _build_quiz_prompt(
                    chunk_question_types, chunk, language, difficulty,
                    additional_prompt, dynamic_types_request, len(question_types) > 1,
                )
                prompts.append(p)

            def _call(p):
                return GptHandler.json_request(p, model_name)

            with concurrent.futures.ThreadPoolExecutor(max_workers=len(chunks)) as ex:
                futures = [ex.submit(_call, p) for p in prompts]
                results = [f.result() for f in concurrent.futures.as_completed(futures)]

            all_questions = []
            for r in results:
                fmt = _format_quiz(r, multiple_types_request)
                all_questions.extend(fmt.get("questions", []))

            quiz = {"questions": all_questions[:total_questions]}
        else:
            prompt, multiple_types_request = _build_quiz_prompt(
                question_types, pdf_text, language, difficulty,
                additional_prompt, dynamic_types_request, len(question_types) > 1,
            )
            raw = GptHandler.json_request(prompt, model_name)
            quiz = _format_quiz(raw, multiple_types_request)
            quiz = remove_extra_questions(quiz, question_types)

        print(f"Generation time: {time.time() - start}")
        print(f"Number of generated quizzes: {len(quiz['questions'])}")

        generated_quiz = GeneratedQuiz.model_validate(quiz)
        asyncio.run(
            generate_quiz(
                user_id=user_id,
                database=database,
                quiz=generated_quiz,
                class_code=class_code,
                settings=settings,
                generation_payload=generation_payload,
            )
        )
    except Exception as e:
        print(f"Generation error: {e}")
        asyncio.run(
            save_generation_info(
                user_id=user_id,
                database=database,
                class_code=class_code,
                generation_payload=generation_payload,
                error=str(e),
            )
        )


@worker.task
def generate_youtube_questions_task(
    text: str,
    url: str,
    language: str | None,
    difficulty: str | None,
    additional_prompt: str | None,
    user_id: str,
    class_code: str,
    model_name: str,
    settings: dict | None,
    question_types: list[dict] | None,
):
    database = get_db()
    start = time.time()

    try:
        prompt, multiple_types_request = _build_quiz_prompt(
            question_types, text, language, difficulty,
            additional_prompt, False, len(question_types) > 1,
        )
        raw = GptHandler.json_request(prompt, model_name)
        quiz = _format_quiz(raw, multiple_types_request)

        print(f"Generation time: {time.time() - start}")
        print(f"Number of generated questions: {len(quiz['questions'])}")

        generated_quiz = GeneratedQuiz.model_validate(quiz)
        asyncio.run(
            generate_quiz(
                user_id=user_id,
                database=database,
                quiz=generated_quiz,
                class_code=class_code,
                settings=settings,
                generation_payload={"url": url, "generated_by": "youtube"},
            )
        )
    except Exception as e:
        print(f"Generation error: {e}")
        asyncio.run(
            save_generation_info(
                user_id=user_id,
                database=database,
                class_code=class_code,
                generation_payload={"url": url, "generated_by": "youtube"},
                error=str(e),
            )
        )


@worker.task
def generate_questions_from_text(
    text: str,
    language: str | None,
    difficulty: str | None,
    additional_prompt: str | None,
    user_id: str,
    class_code: str,
    model_name: str,
    settings: dict | None,
    question_types: list[dict] | None,
):
    database = get_db()
    start = time.time()

    try:
        prompt, multiple_types_request = _build_quiz_prompt(
            question_types, text, language, difficulty,
            additional_prompt, False, len(question_types) > 1,
        )
        raw = GptHandler.json_request(prompt, model_name)
        quiz = _format_quiz(raw, multiple_types_request)
        quiz = remove_extra_questions(quiz, question_types)

        print(f"Generation time: {time.time() - start}")
        print(f"Number of generated questions: {len(quiz['questions'])}")

        generated_quiz = GeneratedQuiz.model_validate(quiz)
        asyncio.run(
            generate_quiz(
                user_id=user_id,
                database=database,
                quiz=generated_quiz,
                class_code=class_code,
                settings=settings,
                generation_payload={"generated_by": "text", "text_length": len(text)},
            )
        )
    except Exception as e:
        print(f"Generation error: {e}")
        asyncio.run(
            save_generation_info(
                user_id=user_id,
                database=database,
                class_code=class_code,
                generation_payload={"generated_by": "text", "text_length": len(text)},
                error=str(e),
            )
        )


@worker.task
def generate_roadmap_from_text(
    text: str,
    language: str | None,
    user_id: str,
    class_code: str,
    model_name: str,
):
    database = get_db()
    start = time.time()
    prompt = roadmap_type_prompt_mapper().build(text=text, language=language)
    roadmap = GptHandler.json_request(prompt, model_name)
    print(f"Generation time: {time.time() - start}")
    generated_roadmap = GeneratedRoadmap.model_validate(roadmap)
    asyncio.run(
        generate_roadmap(
            user_id=user_id,
            database=database,
            roadmap=generated_roadmap,
            class_code=class_code,
            generation_payload={"generated_by": "text", "text_length": len(text)},
        )
    )


@worker.task
def generate_roadmap_from_file(
    pdf_text: str,
    generation_payload: dict,
    user_id: str,
    class_code: str,
    language: str | None,
    model_name: str,
):
    database = get_db()
    start = time.time()
    prompt = roadmap_type_prompt_mapper().build(text=pdf_text, language=language)
    roadmap = GptHandler.json_request(prompt, model_name)
    print(f"Generation time: {time.time() - start}")
    generated_roadmap = GeneratedRoadmap.model_validate(roadmap)
    asyncio.run(
        generate_roadmap(
            user_id=user_id,
            database=database,
            roadmap=generated_roadmap,
            class_code=class_code,
            generation_payload=generation_payload,
        )
    )


@worker.task
def generate_roadmap_from_youtube(
    text: str,
    url: str,
    user_id: str,
    class_code: str,
    language: str | None,
    model_name: str,
):
    database = get_db()
    start = time.time()
    prompt = roadmap_type_prompt_mapper().build(text=text, language=language)
    roadmap = GptHandler.json_request(prompt, model_name)
    print(f"Generation time: {time.time() - start}")
    generated_roadmap = GeneratedRoadmap.model_validate(roadmap)
    asyncio.run(
        generate_roadmap(
            user_id=user_id,
            database=database,
            roadmap=generated_roadmap,
            class_code=class_code,
            generation_payload={"url": url, "generated_by": "youtube"},
        )
    )


@worker.task
def generate_subtopic_from_topic(
    topic_name: str,
    subtopics: str,
    class_code: str,
    language: str | None,
    model_name: str,
):
    database = get_db()
    text = f"Topic name: {topic_name}. Subtopics: {subtopics}."
    prompt = new_subtopic_prompt_mapper().build(text=text, language=language)
    start = time.time()
    new_subtopic = GptHandler.json_request(prompt, model_name)
    print(f"Generation time: {time.time() - start}")
    asyncio.run(
        add_new_subtopic(
            database=database,
            class_code=class_code,
            subtopic=new_subtopic,
            topic_name=topic_name,
        )
    )


@worker.task
def regenerate_subtopics(
    topic_name: str,
    class_code: str,
    model_name: str,
    language: str | None = None,
):
    database = get_db()
    text = f"Topic name: {topic_name}."
    prompt = regenerated_subtopics_prompt_mapper().build(text=text, language=language)
    start = time.time()
    new_subtopics = GptHandler.json_request(prompt, model_name)
    print(f"Generation time: {time.time() - start}")
    asyncio.run(
        regenerate_subtopics_task(
            database=database,
            class_code=class_code,
            subtopics=new_subtopics,
            topic_name=topic_name,
        )
    )


@worker.task
def check_open_question(
    question: str,
    correct_answer: str,
    user_answer: str,
    model_name: str,
) -> int:
    template = CheckOpenQuestion()
    prompt = template.build_open_question_check(
        question=question,
        correct_answer=correct_answer,
        user_answer=user_answer,
    )

    result = GptHandler.text_request(prompt, model_name)
    print(f"Result: {result}")

    try:
        score = int(result.strip())
        if score not in [0, 1]:
            raise ValueError("Invalid score received")
    except (ValueError, TypeError):
        score = 0

    return score
