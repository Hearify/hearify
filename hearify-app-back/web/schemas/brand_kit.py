from pydantic import BaseModel
from ext.pydantic_ext import PydanticObjectId
from ext.google_fonts import FontFace


class BrandKitDTO(BaseModel):
    font: FontFace | None = None
    logo_url: str | None = None
    bg_color: str | None = None
    button_fill: str
    button_text: str
    answer_fill: str
    answer_text: str

class BrandKit(BrandKitDTO):
    user_id: PydanticObjectId

class DBBrandKit(BrandKit):
    id: str
