import requests
from fastapi import HTTPException
from pydantic import BaseModel, Field
from core import config

API_KEY = config.GOOGLE_FONTS_API_KEY

class FontOptions(BaseModel):
    style: str = "normal"
    weight: int = 700

class FontFace(BaseModel):
    family: str
    url: str = Field(pattern=r'(url\(\s*["\']?(https:\/\/fonts\.gstatic\.com\/[^\s)]+)["\']?\s*\)|https:\/\/fonts\.gstatic\.com\/[^\s)]+)')
    options: FontOptions = FontOptions()

def get_font_face(family: str) -> FontFace:
    path = f'https://www.googleapis.com/webfonts/v1/webfonts?family={family}&key={API_KEY}'
    response = requests.get(url=path).json()

    if "error" in response:
        raise HTTPException(
            status_code=404,
            detail="Such font doesn't exists"
        )

    font_face = {
        "family": response["items"][0]["family"],
        "url": response["items"][0]["files"]["regular"]
    }

    return FontFace(**font_face)