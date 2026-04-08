from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from api.dependencies import (
    get_database,
    get_current_user,
    get_group_repository,
)
from schemas import (
    user,
    group_management,
)
from repository.users import UserRepository
from tasks.tasks import task_send_email
from repository.group_management import GroupRepository


router = APIRouter()


@router.get("/groups")
async def list_groups(
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    groups = await group_repo.get_all(user_id=current_user.id)
    return {"message": "success", "groups": groups}


@router.get("/groups/{group_id}/quizzes")
async def list_quizzes(
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_participant = await group_repo.is_participant(
        user_id=current_user.id, group_id=group_id
    )
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    quizzes = await group_repo.get_all_quizzes(group_id=group_id)
    return {"message": "success", "quizzes": quizzes}


@router.get("/groups/{group_id}")
async def get_group(
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_participant = await group_repo.is_participant(
        user_id=current_user.id, group_id=group_id
    )
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    group = await group_repo.get_by_id(group_id=group_id)
    return {"message": "success", "group": group}


@router.get("/groups/{group_id}/users")
async def get_group_members(
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_participant = await group_repo.is_participant(
        user_id=current_user.id, group_id=group_id
    )
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    members = await group_repo.get_all_members(group_id=group_id)
    return {"message": "success", "members": members}


@router.get("/groups/{group_id}/results")
async def get_group_results(
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_participant = await group_repo.is_participant(
        user_id=current_user.id, group_id=group_id
    )
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    group_results = await group_repo.get_group_results(group_id=group_id)

    return {"message": "success", "group_results": group_results}


@router.get("/groups/{group_id}/results/{user_id}")
async def get_personalized_results(
    user_id: str,
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_participant = await group_repo.is_participant(
        user_id=current_user.id, group_id=group_id
    )
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    personalized_results = await group_repo.get_personalized_results(
        user_id=user_id, group_id=group_id
    )

    return {"message": "success", "personalized_results": personalized_results}


@router.post("/groups")
async def create_group(
    group_data: group_management.GroupCreate,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    new_group = await group_repo.create_group(
        data=group_data, owner_id=current_user.id
    )
    return {"message": "success", "group_id": str(new_group)}


@router.post("/groups/{group_id}/invite")
async def invite_member(
    user_email: str,
    group_id: str,
    role: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    is_admin = await group_repo.is_admin(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    invitation = await group_repo.invite_member(
        user_email=user_email, group_id=group_id, role=role
    )
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some problem occured",
        )
    task_send_email.delay(
        invitation[0],
        "New group invitation.",
        f"You were invited to join a study group. Follow this link to join: {invitation[1]}",
    )
    return {"message": "success"}


@router.post("/groups/{group_id}/invite/{user_id}/accept")
async def accept_member(
    user_id: str,
    group_id: str,
    group_repo: GroupRepository = Depends(get_group_repository),
):
    acceptance = await group_repo.accept_member(
        user_id=user_id, group_id=group_id
    )

    if not acceptance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current user was not invited",
        )

    return {"message": "success"}


@router.post("/groups/{group_id}/admin/{user_id}")
async def set_admin(
    user_id: str,
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    # Check if assigned person is a group member.
    is_member = await group_repo.is_member(user_id=user_id, group_id=group_id)
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current user is not a group member.",
        )

    await group_repo.set_admin(user_id=user_id, group_id=group_id)
    return {"message": "success"}


@router.patch("/groups/{group_id}")
async def update_group(
    group_id: str,
    group_data: group_management.GroupUpdate,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    is_admin = await group_repo.is_admin(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    updated_group = await group_repo.update_group(
        group_id=group_id, data=group_data
    )
    return {"message": "success", "group_id": str(updated_group)}


@router.patch("/groups/{group_id}/leave_group")
async def leave_group(
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_member = await group_repo.is_member(
        user_id=current_user.id, group_id=group_id
    )
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )
    await group_repo.leave_group(group_id=group_id, user_id=current_user.id)
    return {"message": "success"}


@router.patch("/groups/{group_id}/change_owner")
async def change_owner(
    user_id: str,
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    is_member = await group_repo.is_member(user_id=user_id, group_id=group_id)
    if not is_owner or not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not owner of this group or this person is not a member",
        )
    await group_repo.change_owner(
        user_id=user_id, previous_owner_id=current_user.id, group_id=group_id
    )
    return {"message": "success"}


@router.put("/groups/{group_id}/quizzes")
async def assign_quizzes(
    group_id: str,
    quizzes: group_management.GroupAssignQuiz,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    is_admin = await group_repo.is_admin(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    await group_repo.assign_quizzes(group_id=group_id, quizzes=quizzes)

    return {"message": "success"}


@router.delete("/groups/{group_id}")
async def delete_group(
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    await group_repo.delete_group(
        group_id=group_id,
    )
    return {"message": "success"}


@router.delete("/groups/{group_id}/users/{user_id}")
async def remove_member(
    user_id: str,
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    is_admin = await group_repo.is_admin(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    removed_member = await group_repo.remove_member(
        user_id=user_id, group_id=group_id
    )
    return {"message": "success"}


@router.delete("/groups/{group_id}/admin/{user_id")
async def remove_admin(
    user_id: str,
    group_id: str,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    await group_repo.remove_admin(user_id=user_id, group_id=group_id)

    return {"message": "success"}


@router.delete("/groups/{group_id}/quizzes")
async def remove_quizzes(
    group_id: str,
    quizzes: group_management.GroupRemoveQuiz,
    current_user: user.UserDB = Depends(get_current_user),
    group_repo: GroupRepository = Depends(get_group_repository),
):
    is_owner = await group_repo.is_owner(
        user_id=current_user.id, group_id=group_id
    )
    is_admin = await group_repo.is_admin(
        user_id=current_user.id, group_id=group_id
    )

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    await group_repo.remove_quizzes(group_id=group_id, quizzes=quizzes)

    return {"message": "success"}
