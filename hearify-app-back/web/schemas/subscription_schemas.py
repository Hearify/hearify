from datetime import datetime
from pydantic import BaseModel, EmailStr


class SubscriptionDB(BaseModel):
    name: str
    description: str
    total_usd: float
    period: str
    every: int

class Payment(BaseModel):
    user_id: str
    subscription_id: str
    order_id: EmailStr
    created_at: datetime

