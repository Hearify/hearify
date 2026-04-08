from enum import Enum
import json
from typing import Generic, List, Literal, Optional

from pydantic import (
    AliasChoices,
    BaseModel,
    Field,
    constr,
    field_validator,
    model_validator,
)

from ext.pydantic_ext import PydanticObjectId
from schemas.mixins import Document, T


class Answer(BaseModel, Generic[T]):
    text: str
    correct: T | None = Field(
        validation_alias=AliasChoices(
            "answer",
            "correct",
            "is_correct",
        )
    )
    points_to: List | None = None


class QuestionBase(BaseModel):
    """Base schema for all types of questions"""

    question: str
    picture_id: PydanticObjectId | None = None
    picture_path: str | None = None
    type: Literal[
        "single_choice",
        "special_single_choice",
        "multiple_choice",
        "opened",
        "fill_in",
        "matching",
        "binary",
        "fc_fill_in",
        "fc_key_concept",
        "fc_translate",
        "fc_enter_what_heard",
        "fc_picture_answer",
        "fc_record_answer",
    ]
    answers: List[Answer[bool]] | List[Answer[str]]
    options: List[str] | None = None


class QuestionDB(Document, QuestionBase):
    """"""


class QuestionUpdate(BaseModel):
    question: str | None = None
    answers: List[Answer[bool]] | List[Answer[str]] | None = None


# REQUESTS TYPES
class QuestionTypes(str, Enum):
    SingleChoice = "SingleChoice"
    MultipleChoice = "MultipleChoice"
    FillInChoice = "FillInChoice"
    Matching = "Matching"
    Binary = "Binary"
    Open = "Open"
    FCFillIn = "FillIn"
    FCKeyConcept = "KeyConcept"
    FCTranslate = "Translate"
    FCRecordAnswer = "RecordAnswer"
    FCAnswerPicture = "AnswerPicture"
    FCEnterWhatHeard = "EnterWhatHeard"


# DB TYPES
class QuestionTypesDB(str, Enum):
    SingleChoice = "single_choice"
    MultipleChoice = "multiple_choice"
    FillInChoice = "fill_in"
    Matching = "matching"
    Binary = "binary"
    Open = "opened"
    FCFillIn = "fc_fill_in"
    FCKeyConcept = "fc_key_concept"
    FCTranslate = "fc_translate"
    FCRecordAnswer = "fc_record_answer"
    FCAnswerPicture = "fc_answer_picture"
    FCEnterWhatHeard = "fc_enter_what_heard"


class QuestionTypeModel(BaseModel):
    name: QuestionTypes
    number_of_questions: int


class Settings(BaseModel):
    minutes: Optional[int] = Field(default=None, ge=0, le=150)
    show_answers: bool = False
    is_public: bool = True
    is_flashcard: bool = False
    show_leaderboard: bool = False


class BaseRoadmapGenerationRequest(BaseModel):
    language: str | None = None

class BaseQuestionGenerationRequest(BaseModel):
    language: str | None = None
    difficulty: str | None = None
    settings: Settings | None = None
    question_types: list[QuestionTypeModel] | None = Field(
        default_factory=lambda: [
            QuestionTypeModel(name="SingleChoice", number_of_questions=5)
        ]
    )
    additional_prompt: constr(max_length=100) | None = None  # type: ignore
    dynamic_types_request: str | None = None

    @field_validator("question_types")
    def validate_question_types(cls, value: list[QuestionTypeModel]):
        total_questions = sum(
            question.number_of_questions for question in value
        )
        if total_questions <= 0 or total_questions > 30:
            raise ValueError(
                "Total number of questions must be between 1 and 30"
            )

        return value


class FileGenerationRequest(BaseQuestionGenerationRequest):
    end_page: Optional[int] = None
    start_page: Optional[int] = None
    has_tables: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, str):
            return cls(**json.loads(value))
        return value

    @model_validator(mode="after")
    def check_passwords_match(self):
        if (
            self.start_page is not None
            and self.end_page is not None
            and (
                self.start_page < 1
                or self.end_page < 1
                or self.start_page > self.end_page
            )
        ):
            raise ValueError("Wrong pages")

        return self


class FileRoadmapGenerationRequest(BaseRoadmapGenerationRequest):
    end_page: Optional[int] = None
    start_page: Optional[int] = None
    has_tables: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, str):
            return cls(**json.loads(value))
        return value

    @model_validator(mode="after")
    def check_passwords_match(self):
        if (
            self.start_page is not None
            and self.end_page is not None
            and (
                self.start_page < 1
                or self.end_page < 1
                or self.start_page > self.end_page
            )
        ):
            raise ValueError("Wrong pages")

        return self

class YouTubeQuestionGenerationRequest(BaseQuestionGenerationRequest):
    url: str
    start_time: str = Field(default="00:00:00")
    end_time: str = Field(default="00:00:00")


class YouTubeRoadmapGenerationRequest(BaseRoadmapGenerationRequest):
    url: str
    start_time: str = Field(default="00:00:00")
    end_time: str = Field(default="00:00:00")


class TextQuestionGenerationRequest(BaseQuestionGenerationRequest):
    text: str


class TextRoadmapGenerationRequest(BaseRoadmapGenerationRequest):
    text: str


class TopicRoadmapGenerationRequest(BaseRoadmapGenerationRequest):
    topic_name: str
    subtopics: List
