import enum
from typing import List, Dict, Optional
from datetime import datetime

from schemas.mixins import Document
from pydantic import BaseModel, Field, EmailStr
from ext.pydantic_ext import PydanticObjectId
from schemas.questions import QuestionBase, QuestionDB


class LeaderboardBreakpoints(BaseModel):
    min_score: int
    max_score: int
    message: str
    description: str
    picture_id: PydanticObjectId | None = None


class QuizSettings(BaseModel):
    minutes: Optional[int] = Field(default=None, ge=0, le=150)
    show_answers: bool = False
    is_public: bool = True
    is_flashcard: bool = False
    show_leaderboard: bool = False
    breakpoints: List[LeaderboardBreakpoints] | None = None


class QuizMembers(BaseModel):
    owners: List[PydanticObjectId]
    editors: List[PydanticObjectId]
    viewers: List[PydanticObjectId]


class QuizBase(BaseModel):
    class_code: str
    user_id: PydanticObjectId
    picture_id: PydanticObjectId | None = None
    picture_path: str | None = None
    name: str | None = None
    settings: QuizSettings
    members: QuizMembers


class Subtopic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    completed: bool
    description: str | None = None
    quizzes: list
    flashcards: list
    study_materials: List[str]


class GeneratedSuptopic(BaseModel):
    name: str
    description: str | None = None
    study_materials: List[str]


class Topic(BaseModel):
    name: str
    completed: bool | None = False
    subtopics: List[GeneratedSuptopic] | List[PydanticObjectId]


class TopicPublic(BaseModel):
    name: str
    completed: bool
    subtopics: List[Subtopic]


class RoadmapBase(BaseModel):
    name: str
    class_code: str
    user_id: PydanticObjectId
    topics: List[Topic]


class QuizDB(Document, QuizBase):
    questions: List[PydanticObjectId]


class QuizPublic(Document, QuizBase):
    questions: List[QuestionDB]


class RoadmapPublic(BaseModel):
    name: str
    topics: List[TopicPublic]
    class_code: str
    user_id: PydanticObjectId
    created_at: datetime | None = None


class GeneratedQuiz(BaseModel):
    """Defines a structure for gpt-generated quiz data"""

    name: str
    questions: List[QuestionBase]


class GeneratedRoadmap(BaseModel):
    """Defines a structure for gpt-generated roadmap data"""
    name: str
    topics: List[Topic]


# Schemas for Quiz update request
class AnswerUpdate(BaseModel):
    text: str | None = None
    correct: bool | str | None = Field(
        serialization_alias="correct", default=None
    )


class QuestionUpdate(BaseModel):
    question: str | None = None
    answers: Dict[int, AnswerUpdate] | None = None


class QuizUpdateRequest(BaseModel):
    name: str | None = None
    questions: Dict[PydanticObjectId, QuestionUpdate] | None = None
    settings: QuizSettings | None = None


class CheckOpenQuestionRequest(BaseModel):
    question_id: str
    answer: str | None = None


class AddMemberRequest(BaseModel):
    role: str
    email: EmailStr


class ChangeMemberRoleRequest(BaseModel):
    new_role: str
    user_id: str


class Roles(enum.Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"
