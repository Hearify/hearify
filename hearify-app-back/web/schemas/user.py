from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, EmailStr, constr

from ext.pydantic_ext import PydanticObjectId


class UserBase(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    role: str | None = None
    subject: List[str] | None = None
    workplace: str | None = None
    company: str | None = None
    birthdate: datetime | None = None
    credits: int | None = None
    credits_refill_at: datetime | None = None


class UserSubscriptionEnum(str, Enum):
    basic = "Basic"
    premium = "Premium"
    max = "Max"


class UserDB(UserBase):
    id: PydanticObjectId
    email: EmailStr
    email_verified: bool
    hashed_password: str | None = None

    created_at: datetime
    updated_at: datetime

    subscription_id: str | None = None
    is_premium_temporary: bool | None = None
    enable_mailing: bool | None = None
    reset_token: str | None = None


class UserCreate(UserBase):
    email: EmailStr
    password: constr(min_length=8)
    enable_mailing: bool


class UserUpdate(UserBase):
    email_verified: bool


class UserPublic(UserBase):
    id: PydanticObjectId
    email: EmailStr
    email_verified: bool
    enable_mailing: bool | None = None
    subscription_id: str | None = None


class UserSubscribe(UserBase):
    email: EmailStr
    subscription_id: str
    payments: list[str] = []


class UserUpdateSchema(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    role: str | None = None
    subject: List[str] | None = None
    workplace: str | None = None
    company: str | None = None
    enable_mailing: bool | None = None

    birthdate: datetime | None = None
