from pydantic import BaseModel


class UpdateQuestionsRequest(BaseModel):
    selected_question_ids: list[int]


class QuizStatusRequest(BaseModel):
    email: str
    class_code: str


class ClassCodeExistsRequest(BaseModel):
    class_code: str
