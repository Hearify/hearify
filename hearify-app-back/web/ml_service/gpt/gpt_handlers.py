from datetime import timedelta
from enum import Enum
from io import BytesIO
import logging
import os
import random
import time

from celery.utils.collections import List
from docx import Document
import easyocr
from fastapi import HTTPException, Depends
import fitz
import openai as openai_module
from pandas import DataFrame
import requests as requests_lib
import tolerantjson
from youtube_transcript_api import YouTubeTranscriptApi
try:
    from youtube_transcript_api.proxies import WebshareProxyConfig, GenericProxyConfig
except ImportError:
    # youtube-transcript-api < 1.0 — proxy support unavailable
    WebshareProxyConfig = None
    GenericProxyConfig = None

from api.dependencies import get_database, get_subscriptions_repository
from core import config
from core.config import USE_GPT_3_5, VIDEO_WITH_SUBTITLES
from helpers.helpers import get_lang_code_name

# from repository.subscriptions import SubscriptionsRepository
from schemas.user import UserDB, UserSubscriptionEnum

logger = logging.getLogger("uvicorn.error")

# ---------------------------------------------------------------------------
# Webshare proxy cache — refreshed at most every hour
# ---------------------------------------------------------------------------
_WEBSHARE_PROXY_CACHE: list[str] = []
_WEBSHARE_PROXY_CACHE_TS: float = 0.0
_WEBSHARE_PROXY_TTL = 3600  # seconds


def _fetch_webshare_proxies() -> list[str]:
    """Return a list of proxy URLs from the Webshare API.

    Format: ["http://user:pass@ip:port", ...]
    Caches results for _WEBSHARE_PROXY_TTL seconds.
    """
    global _WEBSHARE_PROXY_CACHE, _WEBSHARE_PROXY_CACHE_TS

    now = time.time()
    if _WEBSHARE_PROXY_CACHE and now - _WEBSHARE_PROXY_CACHE_TS < _WEBSHARE_PROXY_TTL:
        return _WEBSHARE_PROXY_CACHE

    api_key = config.WEBSHARE_API_KEY
    username = config.WEBSHARE_PROXY_USERNAME
    password = config.WEBSHARE_PROXY_PASSWORD

    if not api_key or not username or not password:
        return []

    try:
        resp = requests_lib.get(
            "https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=25",
            headers={"Authorization": f"Token {api_key}"},
            timeout=10,
        )
        resp.raise_for_status()
        proxies = []
        for p in resp.json().get("results", []):
            addr = p.get("proxy_address")
            port = p.get("port")
            if addr and port:
                proxies.append(f"http://{username}:{password}@{addr}:{port}")
        if proxies:
            _WEBSHARE_PROXY_CACHE = proxies
            _WEBSHARE_PROXY_CACHE_TS = now
            return proxies
    except Exception as exc:
        logger.warning("Failed to fetch Webshare proxy list: %s", exc)

    return _WEBSHARE_PROXY_CACHE  # return stale cache on error


def _fetch_transcript_via_supadata(video_id: str) -> list[dict]:
    """Fetch transcript from Supadata API (no proxy required).

    Returns list of dicts: [{"text": str, "start": float, "duration": float}, ...]
    Raises on any failure so caller can fall back.
    """
    api_key = config.SUPADATA_API_KEY
    if not api_key:
        raise RuntimeError("SUPADATA_API_KEY not configured")

    url = f"https://api.supadata.ai/v1/youtube/transcript?videoId={video_id}"
    resp = requests_lib.get(
        url,
        headers={"x-api-key": api_key},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    content = data.get("content", [])
    if not content:
        raise RuntimeError(f"Supadata returned empty transcript for {video_id}")

    # Supadata returns offset/duration in milliseconds → convert to seconds
    return [
        {
            "text": item["text"],
            "start": item["offset"] / 1000.0,
            "duration": item["duration"] / 1000.0,
        }
        for item in content
    ]

PROXY_LIST = config.PROXY_LIST


class UsageEnum(str, Enum):
    use_gpt4 = "use_gpt4"
    use_gpt3 = "use_gpt3"
    use_file = "use_file"
    use_youtube = "use_youtube"
    use_text = "use_text"


class GptHandler:

    async def validate_usage(
        self,
        user: UserDB,
        key: UsageEnum,
    ) -> bool:
        # In test environment or when user has no subscription, allow everything
        if config.IS_TEST_ENVIRONMENT or not user.subscription_id:
            return True

        subscription_repo = await get_subscriptions_repository()
        user_subscription = await subscription_repo.get_by_id(
            user.subscription_id
        )

        if not user_subscription:
            return True

        if key == UsageEnum.use_gpt4:
            return str(user_subscription.name) == UserSubscriptionEnum.max
        elif key == UsageEnum.use_gpt3:
            return str(user_subscription.name) in {
                UserSubscriptionEnum.premium,
                UserSubscriptionEnum.basic,
            }
        elif key == UsageEnum.use_file:
            return True
        elif key == UsageEnum.use_youtube:
            return str(user_subscription.name) in {
                UserSubscriptionEnum.max,
                UserSubscriptionEnum.premium,
                UserSubscriptionEnum.basic,
            }
        elif key == UsageEnum.use_text:
            return True

        return False

    async def validate_text(
        self,
        text: str,
        user: UserDB,
        # subscription_repo: SubscriptionsRepository = Depends(get_subscriptions_repository),
    ):
        if await self.validate_usage(user, UsageEnum.use_gpt4):
            if len(text) > 400_000:
                return "Text Limit Exceeded: The text you are trying to send exceeds the maximum allowed limit of 400,000 symbols."
        elif await self.validate_usage(user, UsageEnum.use_gpt3):
            if len(text) > 50_000:
                return "Text Limit Exceeded: The text you are trying to send exceeds the maximum allowed limit of 50,000 symbols."
        else:
            raise ValueError("Subscription error")

    def choose_gpt_model_name(self, user: UserDB) -> str:
        if config.USE_GROQ and config.GROQ_API_KEY:
            return config.GROQ_MODELS[0]
        if config.USE_DEEPSEEK and config.OPENROUTER_API_KEY:
            return config.OPENROUTER_FALLBACK_MODELS[0]
        return "gpt-3.5-turbo-0125"

    def extract_json_from_block(self, json: str) -> str:
        start = json.find("{")
        end = json.rfind("}") + 1
        return json[start:end]

    # # The idea is to move this method to the parent class, and delete repeated code from the child classes
    # def select_random_paragraphs(self, paragraphs, num_questions):
    #     if num_questions > len(paragraphs):
    #         num_questions = len(paragraphs)
    #     selected_paragraphs = random.sample(paragraphs, num_questions)
    #     return selected_paragraphs

    @staticmethod
    def json_request(prompt, model_name, temperature=0.8):
        attempts = []

        if config.USE_GROQ and config.GROQ_API_KEY:
            attempts.append((
                openai_module.OpenAI(api_key=config.GROQ_API_KEY, base_url=config.GROQ_BASE_URL),
                config.GROQ_MODELS,
            ))

        if config.USE_DEEPSEEK and config.OPENROUTER_API_KEY:
            attempts.append((
                openai_module.OpenAI(api_key=config.OPENROUTER_API_KEY, base_url=config.OPENROUTER_BASE_URL),
                config.OPENROUTER_FALLBACK_MODELS,
            ))

        if not attempts:
            attempts.append((
                openai_module.OpenAI(api_key=config.OPENAI_API_KEY),
                [model_name],
            ))

        last_error = None
        for client, models in attempts:
            for model in models:
                try:
                    try:
                        completion = client.chat.completions.create(
                            model=model,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=temperature,
                            response_format={"type": "json_object"},
                        )
                    except Exception:
                        completion = client.chat.completions.create(
                            model=model,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=temperature,
                        )
                    return tolerantjson.tolerate(completion.choices[0].message.content)
                except Exception as e:
                    logger.warning("Model %s failed (%s), trying next.", model, e)
                    last_error = e
                    continue

        raise last_error

    @staticmethod
    def text_request(prompt, model_name, temperature=0.8):
        attempts = []

        if config.USE_GROQ and config.GROQ_API_KEY:
            attempts.append((
                openai_module.OpenAI(api_key=config.GROQ_API_KEY, base_url=config.GROQ_BASE_URL),
                config.GROQ_MODELS,
            ))

        if config.USE_DEEPSEEK and config.OPENROUTER_API_KEY:
            attempts.append((
                openai_module.OpenAI(api_key=config.OPENROUTER_API_KEY, base_url=config.OPENROUTER_BASE_URL),
                config.OPENROUTER_FALLBACK_MODELS,
            ))

        if not attempts:
            attempts.append((
                openai_module.OpenAI(api_key=config.OPENAI_API_KEY),
                [model_name],
            ))

        last_error = None
        for client, models in attempts:
            for model in models:
                try:
                    completion = client.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=temperature,
                    )
                    return completion.choices[0].message.content
                except Exception as e:
                    logger.warning("Model %s failed (%s), trying next.", model, e)
                    last_error = e
                    continue

        raise last_error


class FileGptHandler(GptHandler):
    MIN_TEXT_LENGTH = 100
    MAX_DOCX_TEXT_LENGTH = 50000

    def split_text_into_paragraphs(self, text):
        paragraphs = text.split("\n\n")
        paragraphs = [p.strip() for p in paragraphs if p.strip() != ""]
        return paragraphs

    # make pages in tables optional
    def extract_tables(
        self, file_content: bytes, start_page: int, end_page: int
    ):
        TABLE_INSTRUCTION = """
        NOTE: The next content represents the rows of the table. Each row starts with a note: ***NEW ROW***
        and ends with a note ***END OF THE ROW***.
        """

        with fitz.open(stream=file_content) as pdf_doc:
            end_page = (
                min(end_page, pdf_doc.page_count)
                if end_page > 0
                else pdf_doc.page_count
            )
            tables_data = []

            for page_num in range(start_page, end_page):
                page = pdf_doc[page_num]
                page_tables = page.find_tables()

                for table in page_tables:
                    df = table.to_pandas()

                    for index, row in df.iterrows():
                        row_df = DataFrame(row).transpose()
                        markdown_row = row_df.to_markdown(index=False)
                        tables_data.append("***NEW ROW***")
                        tables_data.append(markdown_row)
                        tables_data.append("***END OF THE ROW***")

            return TABLE_INSTRUCTION + "".join(tables_data)

    def extract_text_from_pdf(
        self, file_content: bytes, start_page: int, end_page: int, language: str
    ) -> str:
        pdf_content = []
        pdf_page_length = {}
        with fitz.open(stream=file_content) as pdf_doc:
            end_page = (
                min(end_page, pdf_doc.page_count)
                if end_page > 0
                else pdf_doc.page_count
            )

            for page_num in range(start_page, end_page):
                page = pdf_doc[page_num]
                page_text = page.get_text()
                replacement_char_count = page_text.count("\uFFFD")
                if replacement_char_count > 20:
                    page_text = ""
                pdf_content.append(page_text)

                pdf_page_length[page_num + 1] = len(page.get_text())

        pdf_text = "".join(pdf_content)

        if not pdf_text or replacement_char_count > 20:
            lang_code = get_lang_code_name(language)
            with fitz.open(stream=file_content) as document:
                reader = easyocr.Reader([lang_code])

                for page_num in range(start_page, end_page):
                    page = document[page_num]

                    image = page.get_pixmap()
                    image = image.tobytes()

                    page_info = reader.readtext(image)
                    page_text = [text_info[1] + " " for text_info in page_info]
                    pdf_content.extend(page_text)

        pdf_text = "".join(pdf_content)

        return pdf_text

    def extract_text_from_docx(
        self, file_content: bytes, num_questions: int, language: str
    ) -> str:

        file_stream = BytesIO(file_content)
        doc = Document(file_stream)
        paragraphs = [
            paragraph.text
            for paragraph in doc.paragraphs
            if paragraph.text.strip()
        ]
        doc_text = "\n".join(paragraphs)

        if len(doc_text) > self.MAX_DOCX_TEXT_LENGTH:
            paragraphs = self.split_text_into_paragraphs(doc_text)

            if not paragraphs:  # or replacement_char_count > 20:
                paragraphs = self.extract_text_using_ocr(file_content, language)

            selected_paragraphs = self.select_random_paragraphs(
                paragraphs, num_questions
            )
            doc_text = "\n\n".join(selected_paragraphs)

        return doc_text

    def extract_split_paragraphs(
        self, file_content: bytes, num_questions: int, language: str
    ) -> str:
        pdf_content = []
        replacement_char_count = 0

        with fitz.open(stream=file_content) as pdf_doc:
            for page_num in range(pdf_doc.page_count):
                page = pdf_doc[page_num]
                page_text = page.get_text()
                replacement_char_count += page_text.count("\uFFFD")
                if replacement_char_count <= 20:
                    pdf_content.append(page_text)

        all_text = "\n\n".join(pdf_content)
        paragraphs = self.split_text_into_paragraphs(all_text)

        if not paragraphs or replacement_char_count > 20:
            paragraphs = self.extract_text_using_ocr(file_content, language)

        selected_paragraphs = self.select_random_paragraphs(
            paragraphs, num_questions
        )
        return "\n\n".join(selected_paragraphs)

    def extract_text_using_ocr(
        self, file_content: bytes, language: str
    ) -> list:
        pdf_content = []
        lang_code = get_lang_code_name(language)
        reader = easyocr.Reader([lang_code])

        with fitz.open(stream=file_content) as document:
            for page_num in range(document.page_count):
                page = document[page_num]
                image = page.get_pixmap()
                image_bytes = image.tobytes()
                page_info = reader.readtext(image_bytes)
                page_text = "".join(
                    [text_info[1] + " " for text_info in page_info]
                )
                pdf_content.append(page_text)

        all_text = "\n\n".join(pdf_content)
        paragraphs = self.split_text_into_paragraphs(all_text)
        return paragraphs

    def select_random_paragraphs(self, paragraphs, num_questions):
        if num_questions > len(paragraphs):
            num_questions = len(paragraphs)
        selected_paragraphs = random.sample(paragraphs, num_questions)
        return selected_paragraphs

    async def validate_text(self, text: str, user: UserDB):
        if len(text) < self.MIN_TEXT_LENGTH:  # Check if the text is too short
            raise HTTPException(
                status_code=400,
                detail="The text extracted from the PDF is too short to generate a quiz. Please use a longer document.",
            )

        error = await super().validate_text(text, user)

        if error:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": error,
                },
            )

    async def validate_text_roadmap(self, text: str, user: UserDB):
        if len(text) < 2:
            raise HTTPException(
                status_code=400,
                detail="The text extracted from the PDF is too short to generate a quiz. Please use a longer document.",
            )

        error = await super().validate_text(text, user)

        if error:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": error,
                },
            )


class YoutubeGptHandler(GptHandler):
    def __init__(self):
        self.current_index = 0
        self.transcript_cache = {}

    def _make_api(self, proxy_url: str | None = None) -> YouTubeTranscriptApi:
        """Build a YouTubeTranscriptApi instance with an optional direct proxy."""
        proxy_config = None
        if proxy_url and GenericProxyConfig:
            proxy_config = GenericProxyConfig(https_url=proxy_url, http_url=proxy_url)
        return YouTubeTranscriptApi(proxy_config=proxy_config)

    async def validate_proxie(self, proxie):
        database = get_database()
        video_id = VIDEO_WITH_SUBTITLES[-11:]
        subscript_available = True
        try:
            api = self._make_api(proxy_url=proxie["proxie"])
            api.list(video_id)
        except Exception:
            await database["proxies"].update_one(
                {"_id": proxie["_id"]}, {"$set": {"is_valid": False}}
            )
            subscript_available = False
        return subscript_available

    async def select_random_proxie(self, proxies: List):
        if proxies:
            selected_proxie = random.choice(proxies)
            if await self.validate_proxie(selected_proxie):
                return selected_proxie
            else:
                proxies.remove(selected_proxie)
                return await self.select_random_proxie(proxies)
        else:
            return False

    def split_text_into_chunks(self, text):
        max_len = 1000
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + max_len, len(text))
            # Ensure splitting at a logical point, e.g., after a sentence
            if end < len(text):
                end = text.rfind(".", start, end) + 1 or end
            chunks.append(text[start:end].strip())
            start = end
        logger.warning(
            "Split into %s chunks of up to %s characters", len(chunks), max_len
        )
        return chunks

    def select_random_paragraphs(self, paragraphs, num_questions):
        if num_questions > len(paragraphs):
            num_questions = len(paragraphs)
        selected_paragraphs = random.sample(paragraphs, num_questions)
        logger.warning("Selected %s paragraphs", len(selected_paragraphs))
        return selected_paragraphs

    def _fetch_transcript(self, video_id: str, proxy_url: str | None = None):
        """Fetch transcript using new v1.x API, with optional cookies and proxy.
        Returns a list of dicts with keys: text, start, duration."""
        api = self._make_api(proxy_url=proxy_url)
        transcript_list = api.list(video_id)
        # Prefer manually created, then auto-generated
        try:
            transcript = transcript_list.find_manually_created_transcript(
                list(transcript_list._manually_created_transcripts.keys()) or ["en"]
            )
        except Exception:
            transcript = transcript_list.find_generated_transcript(
                list(transcript_list._generated_transcripts.keys()) or ["en"]
            )
        fetched = transcript.fetch()
        # Normalize to list of dicts for backwards compatibility
        return [{"text": s.text, "start": s.start, "duration": s.duration} for s in fetched]

    async def get_transcript(
        self,
        video_id: str,
        checked_proxies: List | None = [],
        num_of_tries: int | None = 0,
    ):
        if video_id in self.transcript_cache:
            return self.transcript_cache[video_id]

        last_error: Exception | None = None

        # 1. Supadata API — no proxy needed, works from any IP
        try:
            transcript = _fetch_transcript_via_supadata(video_id)
            self.transcript_cache[video_id] = transcript
            logger.warning("Fetched transcript for %s via Supadata (%d snippets)", video_id, len(transcript))
            return transcript
        except Exception as e:
            last_error = e
            logger.warning("Supadata fetch failed for %s: %s", video_id, e)

        # 2. Direct (no proxy) — works in dev / non-blocked environments
        try:
            transcript = self._fetch_transcript(video_id)
            self.transcript_cache[video_id] = transcript
            logger.warning("Fetched transcript for %s (direct)", video_id)
            return transcript
        except Exception as e:
            last_error = e
            logger.warning("Direct fetch failed for %s: %s", video_id, e)

        # 3. Rotate through Webshare datacenter proxies
        proxies = _fetch_webshare_proxies()
        if proxies:
            shuffled = list(proxies)
            random.shuffle(shuffled)
            for proxy_url in shuffled:
                try:
                    transcript = self._fetch_transcript(video_id, proxy_url=proxy_url)
                    self.transcript_cache[video_id] = transcript
                    logger.warning("Fetched transcript for %s via proxy %s", video_id, proxy_url.split("@")[-1])
                    return transcript
                except Exception as e:
                    last_error = e
                    logger.warning("Proxy %s failed for %s: %s", proxy_url.split("@")[-1], video_id, e)

        raise Exception(
            f"Could not fetch transcript for {video_id}. "
            f"Last error: {last_error}. "
            "The video may not have subtitles, or all proxies are blocked."
        )

    async def get_video_duration(self, video_id: str):
        transcript = await self.get_transcript(video_id)

        def seconds_to_hhmmss(seconds):
            hours, remainder = divmod(int(seconds), 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{hours:02}:{minutes:02}:{seconds:02}"

        to_sec = transcript[-1]["start"] + transcript[-1]["duration"]
        to_time = seconds_to_hhmmss(to_sec)

        time_codes = {"from": "00:00:00", "to": to_time}

        return time_codes

    async def extract_subs(
        self,
        video_id: str,
        start_timestamp: timedelta,
        end_timestamp: timedelta,
        num_questions: int,
    ) -> tuple[str, dict[int, int]]:

        transcript = await self.get_transcript(video_id)

        result_text = ""
        minute_length = {}

        # If no timecodes are provided, statement below will be True and all subs will be used
        get_all_text = start_timestamp == timedelta(
            seconds=0
        ) and end_timestamp == timedelta(seconds=0)

        for subtitle in transcript:
            subtitle_start = timedelta(seconds=subtitle["start"])
            subtitle_end = subtitle_start + timedelta(
                seconds=subtitle["duration"]
            )

            current_minute = int(subtitle_start.total_seconds() // 60) + 1

            if get_all_text:
                result_text += subtitle["text"] + " "
                minute_length[current_minute] = minute_length.get(
                    current_minute, 0
                ) + len(subtitle["text"])

            elif (
                start_timestamp <= subtitle_start
                and end_timestamp >= subtitle_end
            ):
                result_text += subtitle["text"] + " "
                minute_length[current_minute] = minute_length.get(
                    current_minute, 0
                ) + len(subtitle["text"])

        logger.warning("Subs lengths: %s", len(result_text))

        # Keep text within ~8 000 chars to stay under Groq free-tier TPM limits.
        # Instead of random sampling (which gives disconnected fragments), take
        # evenly-spaced contiguous sections from beginning / middle / end so the
        # LLM receives coherent, readable context from across the whole video.
        _MAX_YOUTUBE_TEXT = 8_000
        _NUM_SECTIONS = 3
        if len(result_text) > _MAX_YOUTUBE_TEXT:
            logger.warning("Subs lengths before splitting: %s", len(result_text))
            section_len = _MAX_YOUTUBE_TEXT // _NUM_SECTIONS
            total = len(result_text)
            sections = []
            for i in range(_NUM_SECTIONS):
                # Start of each section evenly distributed across the text
                start = (total * i) // _NUM_SECTIONS
                sections.append(result_text[start: start + section_len])
            result_text = "\n\n...\n\n".join(sections)
            logger.warning("Subs lengths after splitting: %s", len(result_text))

        return result_text.strip(), len(result_text)  # minute_length

    # this method is not needed anymore
    async def validate_text(
        self, text: str, user: UserDB, minute_length: dict[int, int]
    ):
        if not self.validate_usage(user, UsageEnum.use_youtube):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "It seems that you do not have the required subscription to perform this action. "
                    "Please upgrade your subscription to access this feature."
                },
            )

        error = await super().validate_text(text, user)
        if error:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": error,
                    "video_length": minute_length,
                },
            )


class TextGptHandler(GptHandler):
    MIN_TEXT_LENGTH = 30

    async def validate_text(self, text: str, user: UserDB):
        if len(text) < self.MIN_TEXT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail="The provided text is too short to generate a quiz. Please provide a longer text.",
            )

        error = await super().validate_text(text, user)
        if error:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": error,
                },
            )


    async def validate_roadmap_text(self, text: str, user: UserDB):
        error = await super().validate_text(text, user)
        if error:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": error,
                },
            )