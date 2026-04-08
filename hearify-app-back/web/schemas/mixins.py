from datetime import datetime
from typing import TypeVar, List, Generic

from pydantic import BaseModel, Field

from ext.pydantic_ext import PydanticObjectId


T = TypeVar("T")


class Document(BaseModel):
    id: PydanticObjectId = Field(alias="_id")

    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


class DateTimeMixin(BaseModel):
    created_at: datetime
    updated_at: datetime


class ResponseItems(BaseModel, Generic[T]):
    count: int
    data: List[T]
