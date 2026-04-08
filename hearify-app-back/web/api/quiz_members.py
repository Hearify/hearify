from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from api.dependencies import get_current_user, get_quiz_repository, get_user_repository
from ext.check_access import check_owner_editor_access, check_owner_access
from repository.quizzes import QuizRepository
from repository.users import UserRepository
from schemas import user, quizzes

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.post("/{class_code}/add_member")
async def add_member_to_quiz(
        class_code: str,
        request: quizzes.AddMemberRequest,
        current_user: user.UserDB = Depends(get_current_user),
        quiz_repo: QuizRepository = Depends(get_quiz_repository),
        user_repo: UserRepository = Depends(get_user_repository)

):

    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class-code does not exist",
        )

    if not check_owner_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    new_member = await user_repo.get_by_field(field="email", value=request.email)

    if not new_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with such email does not exists"
        )

    role = quizzes.Roles(request.role)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Such role does not exists"
        )

    if ObjectId(new_member.id) in (*quiz.members.owners, *quiz.members.editors, *quiz.members.viewers):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User already in quiz team"
        )

    adding_member_result = await quiz_repo.add_member(class_code=class_code, role=role, user_id=new_member.id)

    if not adding_member_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while trying to add new member"
        )

    return {
        "success": True
    }


@router.get("/{class_code}/get_members")
async def get_quiz_members(
        class_code: str,
        quiz_repo: QuizRepository = Depends(get_quiz_repository),
        user_repo: UserRepository = Depends(get_user_repository)
):

    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class-code does not exist",
        )

    owners = [{"role": "owner", "user": await user_repo.get_by_id(member_id)} for member_id in quiz.members.owners]
    editors = [{"role": "editor", "user": await user_repo.get_by_id(member_id)} for member_id in quiz.members.editors]
    viewers = [{"role": "viewer", "user": await user_repo.get_by_id(member_id)} for member_id in quiz.members.viewers]

    return {
        "members": [*owners, *editors, *viewers]
    }


@router.patch("/{class_code}/change_member_role")
async def change_member_role(
        class_code: str,
        request: quizzes.ChangeMemberRoleRequest,
        current_user: user.UserDB = Depends(get_current_user),
        quiz_repo: QuizRepository = Depends(get_quiz_repository)
):
    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not check_owner_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have not access to change users roles"
        )

    role = quizzes.Roles(request.new_role)

    change_role_result = await quiz_repo.change_member_role(class_code=class_code, role=role, user_id=request.user_id)

    if not change_role_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while trying to change members role"
        )

    return {
        "success": True
    }


@router.delete("/{class_code}/{user_id}/delete_member")
async def delete_member_from_quiz(
        class_code: str,
        user_id: str,
        current_user: user.UserDB = Depends(get_current_user),
        quiz_repo: QuizRepository = Depends(get_quiz_repository)
):
    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not check_owner_access(quiz=quiz, current_user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have not access to delete members from quiz"
        )

    deletion_result = await quiz_repo.delete_member(class_code=class_code, user_id=user_id)

    if not deletion_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while trying to delete member"
        )

    return {
        "success": True
    }


@router.get("/{class_code}/get_my_role")
async def get_my_role_on_quiz(
        class_code: str,
        current_user: user.UserDB = Depends(get_current_user),
        quiz_repo: QuizRepository = Depends(get_quiz_repository)
):

    quiz = await quiz_repo.get_by_field(field="class_code", value=class_code)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class-code does not exist",
        )

    if current_user.id == quiz.user_id:
        return "owner"
    if current_user.id in quiz.members.owners:
        return "owner"
    elif current_user.id in quiz.members.editors:
        return "editor"
    elif current_user.id in quiz.members.viewers:
        return "viewer"

