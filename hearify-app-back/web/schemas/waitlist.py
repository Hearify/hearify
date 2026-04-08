from pydantic import BaseModel, EmailStr


class WaitListUser(BaseModel):
    email: EmailStr
    country: str
    first_name: str
    last_name: str
    occupation: str
    how_can_help: str
