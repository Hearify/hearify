from fastapi import APIRouter, Depends

from api.dependencies import get_current_user, get_database


router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/")
async def get_translations(database=Depends(get_database)):
    """"""

    result = {}
    translations = await database['translations'].find().to_list(length=None)

    for translation in translations:
        result[translation['lang']] = translation['translations']

    return result
