import asyncio
import json
import time

from celery import Celery
from langchain.chat_models import ChatOpenAI

from core import config


def get_chat_model(model_name: str) -> ChatOpenAI:
    if config.USE_GROQ and config.GROQ_API_KEY:
        return ChatOpenAI(
            model=config.GROQ_MODELS[0],
            openai_api_key=config.GROQ_API_KEY,
            openai_api_base=config.GROQ_BASE_URL,
        )
    if config.USE_DEEPSEEK and config.OPENROUTER_API_KEY:
        return ChatOpenAI(
            model=config.OPENROUTER_FALLBACK_MODELS[0],
            openai_api_key=config.OPENROUTER_API_KEY,
            openai_api_base=config.OPENROUTER_BASE_URL,
        )
    return ChatOpenAI(model=model_name)
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

worker = Celery(
    broker=config.CELERY_BROKER_URL, backend=config.CELERY_BACKEND_URL
)

worker.conf.result_expires = 30 * 60


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
    # TODO: use logging instead of print
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
    gpt_handler = GptHandler()

    chatbot = get_chat_model(model_name)
    multiple_types_request = False
    dynamic_types_request = dynamic_types_request == "dynamic"

    if dynamic_types_request:
        prompt = DynamicTypesQuestionTemplate().build_dynamic_types(
            question_types,
            text=pdf_text,
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        )
    else:
        if len(question_types) == 1:
            prompt = type_prompt_mapper(question_types[0]["name"]).build(
                text=pdf_text,
                questions_num=question_types[0]["number_of_questions"],
                language=language,
                difficulty=difficulty,
                additional_prompt=additional_prompt,
            )
        else:
            multiple_types_request = True
            prompt = MultipleTypesQuestionTemplate().build(
                question_types,
                text=pdf_text,
                language=language,
                difficulty=difficulty,
                additional_prompt=additional_prompt,
            )

    start = time.time()
    raw_quiz = chatbot.predict(prompt)
    print(f"Generation time: {time.time() - start}")
    try:
        quiz = json.loads(gpt_handler.extract_json_from_block(raw_quiz))
        quiz = (
            multiple_format_fill_in_questions(quiz)
            if multiple_types_request
            else format_fill_in_questions(quiz)
        )
        quiz = remove_extra_questions(quiz, question_types)

    except json.JSONDecodeError:
        print(f"{raw_quiz = }")
        print("Not a correct json. Generating new")
        start = time.time()
        raw_quiz = chatbot.predict(prompt)
        print(f"Generation time 2: {time.time() - start}")
        print(f"new_{raw_quiz = }")
        try:
            quiz = json.loads(gpt_handler.extract_json_from_block(raw_quiz))
        except json.JSONDecodeError:
            print("JSON decoding error")
            asyncio.run(
                save_generation_info(
                    user_id=user_id,
                    database=database,
                    class_code=class_code,
                    generation_payload=generation_payload,
                    error="JSON decoding error",
                )
            )
            return

        quiz = remove_extra_questions(quiz, question_types)
        quiz = (
            multiple_format_fill_in_questions(quiz)
            if multiple_types_request
            else format_fill_in_questions(quiz)
        )

    print(f"Number of generated quizzes: {len(quiz['questions'])}")
    print(f"Generated quiz from pdf: {quiz}")

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
    gpt_handler = GptHandler()

    chatbot = get_chat_model(model_name)

    start = time.time()
    multiple_types_request = False
    if len(question_types) == 1:
        prompt = type_prompt_mapper(question_types[0]["name"]).build(
            text=text,
            questions_num=question_types[0]["number_of_questions"],
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        )
    else:
        multiple_types_request = True
        prompt = MultipleTypesQuestionTemplate().build(
            question_types,
            text=text,
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        )

    raw_quiz = chatbot.predict(prompt)
    try:
        quiz = json.loads(gpt_handler.extract_json_from_block(raw_quiz))
        quiz = (
            multiple_format_fill_in_questions(quiz)
            if multiple_types_request
            else format_fill_in_questions(quiz)
        )
    except json.JSONDecodeError:
        print("Not a correct json. Generating new")

        raw_quiz = chatbot.predict(prompt)
        print(f"Generation time 2: {time.time() - start}")

        print(f"new_{raw_quiz = }")
        try:
            quiz = json.loads(gpt_handler.extract_json_from_block(raw_quiz))
        except json.JSONDecodeError:
            print("JSON decoding error")
            asyncio.run(
                save_generation_info(
                    user_id=user_id,
                    database=database,
                    class_code=class_code,
                    generation_payload={
                        "url": url,
                        "generated_by": "youtube",
                    },
                    error="JSON decoding error",
                )
            )
            return

        quiz = (
            multiple_format_fill_in_questions(quiz)
            if multiple_types_request
            else format_fill_in_questions(quiz)
        )

    print(f"Generation time: {time.time() - start}")

    print(f"Number of generated questions: {len(quiz['questions'])}")
    print(f"Generated questions from pdf: {quiz}")

    generated_quiz = GeneratedQuiz.model_validate(quiz)

    asyncio.run(
        generate_quiz(
            user_id=user_id,
            database=database,
            quiz=generated_quiz,
            class_code=class_code,
            settings=settings,
            generation_payload={
                "url": url,
                "generated_by": "youtube",
            },
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
    gpt_handler = GptHandler()
    chatbot = get_chat_model(model_name)
    multiple_types_request = False
    if len(question_types) == 1:
        prompt = type_prompt_mapper(question_types[0]["name"]).build(
            text=text,
            questions_num=question_types[0]["number_of_questions"],
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        )
    else:
        multiple_types_request = True
        prompt = MultipleTypesQuestionTemplate().build(
            question_types,
            text=text,
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        )

    start = time.time()
    raw_quiz = chatbot.predict(prompt)
    print(f"Generation time: {time.time() - start}")
    try:
        quiz = json.loads(gpt_handler.extract_json_from_block(raw_quiz))
        quiz = (
            multiple_format_fill_in_questions(quiz)
            if multiple_types_request
            else format_fill_in_questions(quiz)
        )
    except json.JSONDecodeError:
        print(f"{raw_quiz = }")
        print("Not a correct json. Generating new")

        start = time.time()
        raw_quiz = chatbot.predict(prompt)
        print(f"Generation time 2: {time.time() - start}")

        print(f"new_{raw_quiz = }")

        try:
            quiz = json.loads(gpt_handler.extract_json_from_block(raw_quiz))
        except json.JSONDecodeError:
            print("JSON decoding error")
            asyncio.run(
                save_generation_info(
                    user_id=user_id,
                    database=database,
                    class_code=class_code,
                    generation_payload={
                        "text_length": len(text),
                        "generated_by": "text",
                    },
                    error="JSON decoding error",
                )
            )
            return

        quiz = (
            multiple_format_fill_in_questions(quiz)
            if multiple_types_request
            else format_fill_in_questions(quiz)
        )

    print(f"Number of generated questions: {len(quiz['questions'])}")
    print(f"Generated questions from pdf: {quiz}")
    generated_quiz = GeneratedQuiz.model_validate(quiz)
    asyncio.run(
        generate_quiz(
            user_id=user_id,
            database=database,
            quiz=generated_quiz,
            class_code=class_code,
            settings=settings,
            generation_payload={
                "generated_by": "text",
                "text_length": len(text),
            },
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
    gpt_handler = GptHandler()
    chatbot = get_chat_model(model_name)
    prompt = roadmap_type_prompt_mapper().build(
        text=text,
        language=language,
    )
    start = time.time()
    raw_roadmap = chatbot.predict(prompt)
    print(f"Generation time: {time.time() - start}")
    roadmap = json.loads(gpt_handler.extract_json_from_block(raw_roadmap))
    generated_roadmap = GeneratedRoadmap.model_validate(roadmap)
    asyncio.run(
        generate_roadmap(
            user_id=user_id,
            database=database,
            roadmap=generated_roadmap,
            class_code=class_code,
            generation_payload={
                "generated_by": "text",
                "text_length": len(text),
            },
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
    gpt_handler = GptHandler()

    chatbot = get_chat_model(model_name)

    prompt = roadmap_type_prompt_mapper().build(
        text=pdf_text,
        language=language,
    )

    start = time.time()
    raw_roadmap = chatbot.predict(prompt)

    print(f"Generation time: {time.time() - start}")
    roadmap = json.loads(gpt_handler.extract_json_from_block(raw_roadmap))
    generated_roadmap = GeneratedRoadmap.model_validate(roadmap)

    asyncio.run(
        generate_roadmap(
            user_id=user_id,
            database=database,
            roadmap=generated_roadmap,
            class_code=class_code,
            generation_payload=generation_payload
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
    gpt_handler = GptHandler()

    chatbot = get_chat_model(model_name)

    prompt = roadmap_type_prompt_mapper().build(
        text=text,
        language=language,
    )

    start = time.time()
    raw_roadmap = chatbot.predict(prompt)

    print(f"Generation time: {time.time() - start}")
    roadmap = json.loads(gpt_handler.extract_json_from_block(raw_roadmap))
    generated_roadmap = GeneratedRoadmap.model_validate(roadmap)

    asyncio.run(
        generate_roadmap(
            user_id=user_id,
            database=database,
            roadmap=generated_roadmap,
            class_code=class_code,
            generation_payload={
                "url": url,
                "generated_by": "youtube",
            },
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
    gpt_handler = GptHandler()
    chatbot = get_chat_model(model_name)
    text = f"Topic name: {topic_name}. Subtopics: {subtopics}."
    prompt = new_subtopic_prompt_mapper().build(
        text=text,
        language=language,
    )
    start = time.time()
    subtopic = chatbot.predict(prompt)
    print(f"Generation time: {time.time() - start}")

    new_subtopic = json.loads(gpt_handler.extract_json_from_block(subtopic))
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
    gpt_handler = GptHandler()
    chatbot = get_chat_model(model_name)
    text = f"Topic name: {topic_name}."
    prompt = regenerated_subtopics_prompt_mapper().build(
        text=text,
        language=language,
    )
    start = time.time()
    subtopics = chatbot.predict(prompt)
    print(f"Generation time: {time.time() - start}")

    new_subtopics = json.loads(gpt_handler.extract_json_from_block(subtopics))
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
    chatbot = get_chat_model(model_name)
    template = CheckOpenQuestion()
    prompt = template.build_open_question_check(
        question=question,
        correct_answer=correct_answer,
        user_answer=user_answer,
    )

    result = chatbot.predict(prompt)
    print(f"Result: {result}")

    try:
        score = int(result.strip())
        if score not in [0, 1]:
            raise ValueError("Invalid score received")
    except (ValueError, TypeError):
        score = 0

    return score
