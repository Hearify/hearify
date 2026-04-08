from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_database
from schemas.waitlist import WaitListUser
from motor.motor_asyncio import AsyncIOMotorDatabase


router = APIRouter()


@router.post("/")
async def add_user_to_wait_list(
    request: WaitListUser,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """"""

    db_record = await database['wait_list'].find_one({'email': request.email})

    if db_record:
        raise HTTPException(
            status_code=400,
            detail='Cannot add you to the wait-list: email is not correct or you already applied before'
        )

    await database['wait_list'].insert_one({
        **request.model_dump(),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
    })

    return {'success': True}
