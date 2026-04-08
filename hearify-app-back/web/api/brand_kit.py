import arrow
from fastapi import APIRouter, Depends, HTTPException, UploadFile

from api.dependencies import get_current_user, get_brand_kit_repository
from repository.brand_kit import BrandKitRepository
from schemas.brand_kit import BrandKitDTO, BrandKit, DBBrandKit
from schemas.user import UserDB
import ext.blob_storage as blob_storage
import ext.google_fonts as google_fonts
from starlette.status import HTTP_404_NOT_FOUND

router = APIRouter()

@router.post('/save')
async def save_brand_kit(
        brand_kit: BrandKitDTO,
        current_user: UserDB = Depends(get_current_user),
        brand_kit_repo: BrandKitRepository = Depends(get_brand_kit_repository)
):
    payload = {
        "user_id": current_user.id,
        **dict(brand_kit)
    }
    brand_kit = BrandKit.model_validate(payload)

    existing_brand_kit = await brand_kit_repo.get_by_user_id(str(current_user.id))

    if existing_brand_kit:
        await brand_kit_repo.update_by_user_id(user_id=str(current_user.id), brand_kit=brand_kit)
        return {"result": 200}

    else:
        result = await brand_kit_repo.save(brand_kit=brand_kit)
        return {"result": result}

@router.get('/{user_id}')
async def get_brand_kit(
        user_id: str,
        brand_kit_repo: BrandKitRepository = Depends(get_brand_kit_repository)
) -> BrandKitDTO:

    brand_kit = await brand_kit_repo.get_by_user_id_to_dto(user_id)

    if not brand_kit:
        brand_kit = await brand_kit_repo.get_default_brand_kit()

    return brand_kit

@router.patch('/save-logo')
async def save_logo(
        file: UploadFile,
        current_user: UserDB = Depends(get_current_user),
        brand_kit_repo: BrandKitRepository = Depends(get_brand_kit_repository)
):
    blob_name = file.filename + "___" + str(arrow.utcnow())
    blob_url = f"https://hearifyproduct.blob.core.windows.net/images/{blob_name}"

    brand_kit = await brand_kit_repo.get_by_user_id(user_id=str(current_user.id))

    if brand_kit.logo_url:
        blob_storage.delete_previous_blob(
            name=blob_storage.parse_name_from_url(brand_kit.logo_url)
        )

    result = blob_storage.create_upload_photo(name=blob_name, file=file)

    await brand_kit_repo.update_logo_by_user_id(
        user_id=str(current_user.id),
        logo_url=blob_url
    )

    return {
        "message": result["message"],
        "status": result["status"],
        "blob_url": blob_url
    }

@router.get("/fonts/{family}")
async def get_google_font(family: str):
    return google_fonts.get_font_face(family)