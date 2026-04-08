import os
from uuid import uuid4
from hashlib import md5
from datetime import datetime
from mimetypes import guess_extension

import aiofiles
from bson import ObjectId
from fastapi.responses import FileResponse, Response
from fastapi import APIRouter, UploadFile, Depends, HTTPException, status

from schemas.user import UserDB
from core.config import FILES_STORAGE
from ext.avatars.avatars import get_random_avatar
from api.dependencies import get_current_user, get_database

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile,
    database=Depends(get_database),
    current_user: UserDB = Depends(get_current_user),
):
    """WIP: Route is currently being developed"""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="ROUTE IS BEING DEVELOPED"
    )

    now_ = datetime.utcnow()
    content = await file.read()

    new_name = uuid4().hex
    file_ext = guess_extension(file.content_type)
    file_path = os.path.join(FILES_STORAGE, f"{new_name}.{file_ext}")

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    await database["files"].insert_one(
        {
            "size": len(content),
            "old_name": file.filename,
            "content_type": file.content_type,
            "file_name": f"{new_name}.{file_ext}",
            "hash": md5(content),
            "created_at": now_,
            "updated_at": now_,
            "user_id": ObjectId(current_user.id),
        }
    )


@router.get("/{file_name:path}")
async def download_file(
    file_name: str,
    database=Depends(get_database),
):
    """"""
    file_record = await database["files"].find_one({"file_name": file_name})

    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This file does not exist",
        )

    file_path = file_record["file_path"]

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such file does not exist",
        )

    return FileResponse(file_path)


@router.get("/random-avatar/")
def get_avatar():
    """"""

    avatar = get_random_avatar()

    return Response(content=avatar, media_type="image/svg+xml")
