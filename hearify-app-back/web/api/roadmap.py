from fastapi import APIRouter, Depends, HTTPException, status
from typing import Literal
from schemas import user
from api.generate_questions import generate_subtopic_roadmap, regenerate_subtopics_roadmap

from api.dependencies import (
    QuizRepository,
    RoadmapRepository,
    get_current_user,
    get_quiz_repository,
    get_roadmap_repository
)

router = APIRouter()


@router.get("/my")
async def get_all_my_roadmaps(
        limit: int,
        skip: int,
        sort: Literal["asc", "desc"],
        current_user: user.UserDB = Depends(get_current_user),
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    """Returns all roadmaps that the user is a part of"""
    _roadmaps = await roadmap_repo.get_all(
        skip=skip,
        limit=limit,
        _filter={"user_id": current_user.id},
        sort={
            "key_or_list": "created_at",
            "direction": {"asc": 1, "desc": -1}[sort],
        },
    )

    count = await roadmap_repo.collection.count_documents({"user_id": current_user.id})

    return {"count": count, "data": _roadmaps}


@router.get("/{class_code}")
async def get_roadmap_by_class_code(
        class_code: str,
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    """Returns roadmap by its class code"""
    roadmap = await roadmap_repo.get_by_field(field="class_code", value=class_code)

    if not roadmap:
        raise HTTPException(
            detail="Roadmap with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return roadmap


@router.delete("/{class_code}")
async def delete_roadmap_by_class_code(
        class_code: str,
        current_user: user.UserDB = Depends(get_current_user),
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    """Deletes roadmap by its class code"""
    roadmap = await roadmap_repo.get_by_field(field="class_code", value=class_code)

    if not roadmap:
        raise HTTPException(
            detail="Roadmap with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    has_access = await roadmap_repo.check_owner_access(class_code=class_code, user_id=current_user.id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    await roadmap_repo.delete_subtopics(class_code=class_code)

    await roadmap_repo.delete_by_class_code(class_code=class_code)

    return {"class_code": class_code}


@router.delete("/{class_code}/subtopics/{subtopic_id}")
async def delete_subtopic(
        class_code: str,
        subtopic_id: str,
        current_user: user.UserDB = Depends(get_current_user),
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    roadmap = await roadmap_repo.get_by_field(field="class_code", value=class_code)
    if not roadmap:
        raise HTTPException(
            detail="Roadmap with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    has_access = await roadmap_repo.check_owner_access(class_code=class_code, user_id=current_user.id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    subtopic_exists = await roadmap_repo.check_subtopic_exists(class_code=class_code, subtopic_id=subtopic_id)
    if not subtopic_exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subtopic with such id was not found",
        )

    await roadmap_repo.remove_subtopic(class_code=class_code, subtopic_id=subtopic_id)

    return {"class_code": class_code}


@router.post("/{class_code}/subtopics/generate_one")
async def generate_new_subtopic(
        class_code: str,
        topic_name: str,
        language: str | None = None,
        current_user: user.UserDB = Depends(get_current_user),
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    roadmap = await roadmap_repo.get_by_field(field="class_code", value=class_code)
    if not roadmap:
        raise HTTPException(
            detail="Roadmap with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    has_access = await roadmap_repo.check_owner_access(class_code=class_code, user_id=current_user.id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    topic = await roadmap_repo.topic_exists(class_code=class_code, topic_name=topic_name)
    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Topic with such name does not exist",
        )

    subtopics = await roadmap_repo.get_all_subtopics(topic=topic)

    request = {"topic": topic_name, "subtopics": subtopics, "language": language}
    task_id = await generate_subtopic_roadmap(request=request, class_code=class_code, current_user=current_user)

    return {"task_id": task_id, "class_code": class_code}


@router.post("/{class_code}/subtopics/regenerate")
async def regenerate_subtopics(
        class_code: str,
        topic_name: str,
        language: str| None = None,
        current_user: user.UserDB = Depends(get_current_user),
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    roadmap = await roadmap_repo.get_by_field(field="class_code", value=class_code)
    if not roadmap:
        raise HTTPException(
            detail="Roadmap with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    has_access = await roadmap_repo.check_owner_access(class_code=class_code, user_id=current_user.id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    topic = await roadmap_repo.topic_exists(class_code=class_code, topic_name=topic_name)
    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Topic with such name does not exist",
        )

    task_id = await regenerate_subtopics_roadmap(topic_name=topic_name, class_code=class_code, current_user=current_user, language=language)

    return {"task_id": task_id, "class_code": class_code}


@router.delete("/{class_code}/topics")
async def delete_topic(
        class_code: str,
        topic_name: str,
        current_user: user.UserDB = Depends(get_current_user),
        roadmap_repo: RoadmapRepository = Depends(get_roadmap_repository),
):
    roadmap = await roadmap_repo.get_by_field(field="class_code", value=class_code)
    if not roadmap:
        raise HTTPException(
            detail="Roadmap with such class_code was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    has_access = await roadmap_repo.check_owner_access(class_code=class_code, user_id=current_user.id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to perform such operation",
        )

    topic = await roadmap_repo.topic_exists(class_code=class_code, topic_name=topic_name)
    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Topic with such name does not exist",
        )

    await roadmap_repo.delete_topic(class_code=class_code, topic_name=topic_name)

    return {"class_code": class_code}