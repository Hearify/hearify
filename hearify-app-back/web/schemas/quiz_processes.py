from typing import List
from pydantic import BaseModel
from ext.pydantic_ext import PydanticObjectId


class QuizProcessDTO(BaseModel):
    id: str
    user_id: str | None = None
    user_name: str | None = None
    class_code: str
    is_submitted: bool
    is_public: bool
    created_at: str
    questions: int
    correct_answers: int
    answers: List[dict]
    is_owner: bool
    submitted_at: str


class QuizProcessResponse(BaseModel):
    process_id: str
    class_code: str


class AnswerQuestionRequest(BaseModel):
    answer: str | list
    question_id: PydanticObjectId
    answer_index: int
