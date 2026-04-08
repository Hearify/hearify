from fastapi import APIRouter, Depends, HTTPException, status

from repository.users import UserRepository
from schemas.user import UserPublic, UserDB, UserUpdateSchema
from api.dependencies import get_user_repository, get_current_user


router = APIRouter()


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserDB = Depends(get_current_user)):
    """"""

    return current_user


@router.patch("/me", response_model=UserPublic)
async def update_me(
    update_data: UserUpdateSchema,
    current_user: UserDB = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository)
):

    return await user_repo.update_user(
        user_id=current_user.id,
        payload=update_data.model_dump(exclude_unset=True)
    )


@router.get("/{email}/profile")
async def get_student_general_profile(current_user: UserDB = Depends(get_current_user)):
    """Returns general profile for user"""

    raise HTTPException(detail="Route in progress", status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.get("/{email}/profile/{class_code}")
async def get_student_personalization(current_user: UserDB = Depends(get_current_user)):
    """Returns a concrete quiz student personalization"""
    
    raise HTTPException(detail="Route in progress", status_code=status.HTTP_501_NOT_IMPLEMENTED)

@router.get("/me/have_password")
async def get_is_user_have_password(current_user: UserDB = Depends(get_current_user)):
    return bool(current_user.hashed_password)