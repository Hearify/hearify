from typing import List
from bson import ObjectId
from datetime import datetime

from pydantic import (
    BaseModel,
)


class GroupBase(BaseModel):
    name: str
    description: str | None = None

    admins: list | None = []
    members: list | None = []
    invited_members: list | None = []

    assigned_quizzes: list | None = []


class GroupDB(GroupBase):
    id: str
    owner_id: str


class GroupPublic(GroupBase):
    _id: str


class GroupCreate(GroupBase):
    created_at: datetime | None = None


class GroupUpdate(GroupBase):
    updated_at: datetime | None = None


class GroupMembersPublic(BaseModel):
    member_id: str


class GroupInviteMember(BaseModel):
    member_id: str


class GroupAssignQuiz(BaseModel):
    quiz_id: List[str]
    assigned_at: datetime | None = None


class GroupRemoveQuiz(BaseModel):
    quiz_id: List[str]
