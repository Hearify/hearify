from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status

from core import config
from repository.base import BaseRepository
from schemas.group_management import (
    GroupAssignQuiz,
    GroupBase,
    GroupCreate,
    GroupDB,
    GroupMembersPublic,
    GroupPublic,
    GroupRemoveQuiz,
    GroupUpdate,
)


class GroupRepository(BaseRepository):

    async def is_owner(self, user_id: str, group_id: str) -> bool:
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})

        if str(user_id) == str(group["owner_id"]):
            return True
        return False

    async def is_admin(self, user_id: str, group_id: str) -> bool:
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})

        group_admins = []
        for admin in group["admins"]:
            if str(user_id) == admin["admin_id"]:
                group_admins.append(str(user_id))
        if str(user_id) in group_admins:
            return True
        return False

    async def is_member(self, user_id: str, group_id: str) -> bool:
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})
        group_members = []
        for member in group["members"]:
            if str(user_id) == member["member_id"]:
                group_members.append(str(user_id))
        if str(user_id) in group_members:
            return True
        return False

    async def is_participant(self, user_id: str, group_id: str) -> bool:
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})
        is_admin = await self.is_admin(user_id, group_id)
        is_member = await self.is_member(user_id, group_id)
        if str(user_id) == str(group.get("owner_id")) or is_admin or is_member:
            return True
        return False

    async def is_invited(self, user_id: str, group_id: str) -> bool:
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})

        invited_members = []
        for invited_member in group["invited_members"]:
            if str(user_id) == str(invited_member["invited_id"]):
                invited_members.append(invited_member)
        if str(user_id) in invited_members:
            return True
        return False

    async def get_all(self, user_id: str) -> list[GroupPublic]:
        raw_groups = []
        collection = self.database.get_collection("groups")
        quizzes = self.database.get_collection("quizzes")
        questions = self.database.get_collection("questions")
        async for group in collection.find():
            is_participant = await self.is_participant(
                user_id=user_id, group_id=str(group["_id"])
            )
            group_questions = []
            assigned_quizzes = []
            for quiz in group["assigned_quizzes"]:
                group_quiz = await quizzes.find_one(
                    {"_id": ObjectId(quiz["quiz_id"])}
                )
                if group_quiz:
                    for question in group_quiz["questions"]:
                        question_db = await questions.find_one(
                            {"_id": question}
                        )
                        question_db["_id"] = str(question_db["_id"])
                        question_db["picture_id"] = str(
                            question_db["picture_id"]
                        )
                        group_questions.append(question_db)
                    group_quiz["_id"] = str(group_quiz["_id"])
                    group_quiz["user_id"] = str(group_quiz["user_id"])
                    group_quiz["picture_id"] = str(group_quiz["picture_id"])
                    group_quiz["questions"] = group_questions
                    assigned_quizzes.append(group_quiz)
                else:
                    pass
            group["_id"] = str(group["_id"])
            group["assigned_quizzes"] = assigned_quizzes
            if is_participant:
                raw_groups.append(group)
        return [group for group in raw_groups]

    async def get_by_id(self, group_id: str) -> GroupDB | None:
        group_collection = self.database.get_collection("groups")
        user_collection = self.database.get_collection("users")
        group = await group_collection.find_one({"_id": ObjectId(group_id)})

        if group:
            members = []
            admins = []
            group_owner = await user_collection.find_one(
                {"_id": ObjectId(group["owner_id"])}
            )
            owner_dataset = {
                "_id": str(group_owner["_id"]),
                "name": group_owner["first_name"]
                + " "
                + group_owner["surname"],
                "email": group_owner["email"],
                "status": "Accepted",
                "role": "Owner",
            }
            members.append(owner_dataset)
            for member in group["members"]:
                user = await user_collection.find_one(
                    {"_id": ObjectId(member["member_id"])}
                )
                user_dataset = {
                    "_id": str(member["member_id"]),
                    "name": user["first_name"] + " " + user["surname"],
                    "email": user["email"],
                    "status": "Accepted",
                    "role": "Member",
                }
                members.append(user_dataset)
            for admin in group["admins"]:
                user = await user_collection.find_one(
                    {"_id": ObjectId(admin["admin_id"])}
                )
                admin_dataset = {
                    "_id": str(admin["admin_id"]),
                    "name": user["first_name"] + " " + user["surname"],
                    "email": user["email"],
                    "status": "Accepted",
                    "role": "Admin",
                }
                admins.append(admin_dataset)
            group["id"] = str(group.pop("_id"))
            group["members"] = members
            group["admins"] = admins
            return GroupDB(**group)

    async def get_all_members(self, group_id: str) -> list:
        raw_members = []
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})
        for member in group["members"]:
            raw_members.append(member)
        return raw_members

    async def get_all_quizzes(self, group_id: str) -> list:
        collection = self.database.get_collection("groups")
        questions = self.database.get_collection("questions")
        quizzes = self.database.get_collection("quizzes")

        group = await collection.find_one({"_id": ObjectId(group_id)})

        group_questions = []
        assigned_quizzes = []

        for quiz in group["assigned_quizzes"]:
            group_quiz = await quizzes.find_one(
                {"_id": ObjectId(quiz["quiz_id"])}
            )
            if group_quiz:
                for question in group_quiz["questions"]:
                    question_db = await questions.find_one({"_id": question})
                    question_db["_id"] = str(question_db["_id"])
                    question_db["picture_id"] = str(question_db["picture_id"])
                    group_questions.append(question_db)
                group_quiz["_id"] = str(group_quiz["_id"])
                group_quiz["user_id"] = str(group_quiz["user_id"])
                if group_quiz["picture_id"]:
                    group_quiz["picture_id"] = str(group_quiz["picture_id"])
                else:
                    group_quiz.pop("picture_id")
                if group_quiz["picture_path"]:
                    group_quiz["picture_path"] = str(group_quiz["picture_path"])
                else:
                    group_quiz.pop("picture_path")
                group_quiz["questions"] = group_questions
                assigned_quizzes.append(group_quiz)
                group_questions = []
            else:
                pass
        group["assigned_quizzes"] = assigned_quizzes
        return group["assigned_quizzes"]

    async def get_group_results(self, group_id: str) -> list:
        quiz_collection = self.database.get_collection("quizzes")
        quiz_process_collection = self.database.get_collection("quiz_process")
        group_collection = self.database.get_collection("groups")
        group = await group_collection.find_one({"_id": ObjectId(group_id)})

        group_results = []
        for quiz_id in group["assigned_quizzes"]:
            quiz = await quiz_collection.find_one(
                {"_id": ObjectId(quiz_id["quiz_id"])}
            )
            result = {"quiz": quiz}
            class_code = quiz["class_code"]
            for member in group["members"]:
                quiz_process = await quiz_process_collection.find_one(
                    {"class_code": class_code}, sort=[("_id", -1)]
                )
                if quiz_process["is_submitted"]:
                    if str(quiz_process["user_id"]) == str(member["member_id"]):
                        quiz_process["_id"] = str(quiz_process["_id"])
                        quiz_process["user_id"] = str(quiz_process["user_id"])
                        result["quiz_process"] = quiz_process
            group_results.append(result)
        return group_results

    async def get_personalized_results(
        self, user_id: str, group_id: str
    ) -> list:
        quiz_collection = self.database.get_collection("quizzes")
        quiz_process_collection = self.database.get_collection("quiz_process")
        group_collection = self.database.get_collection("groups")
        group = await group_collection.find_one({"_id": ObjectId(group_id)})

        personalized_results = []
        for quiz_id in group["assigned_quizzes"]:
            quiz = await quiz_collection.find_one(
                {"_id": ObjectId(quiz_id["quiz_id"])}
            )
            result = {"quiz": quiz}
            class_code = quiz["class_code"]
            quiz_process = await quiz_process_collection.find_one(
                {"class_code": class_code, "user_id": ObjectId(user_id)},
                sort=[("_id", -1)],
            )
            if quiz_process:
                if quiz_process["is_submitted"]:
                    quiz_process["_id"] = str(quiz_process["_id"])
                    quiz_process["user_id"] = str(quiz_process["user_id"])
                    result["quiz_process"] = quiz_process
                personalized_results.append(result)
        return personalized_results

    async def create_group(self, owner_id: str, data: GroupCreate) -> ObjectId:
        collection = self.database.get_collection("groups")
        group_payload = {
            **data.model_dump(),
            "owner_id": str(owner_id),
            "created_at": datetime.now(),
        }
        group = await collection.insert_one(group_payload)
        return group.inserted_id

    async def set_admin(self, user_id: str, group_id: str) -> None:
        collection = self.database.get_collection("groups")
        await collection.update_one(
            {"_id": ObjectId(group_id)},
            update={
                "$push": {
                    "admins": {
                        "admin_id": str(user_id),
                        "promoted_at": datetime.now(),
                    }
                }
            },
        )

    async def change_owner(
        self, user_id: str, previous_owner_id: str, group_id: str
    ) -> None:
        collection = self.database.get_collection("groups")
        await collection.update_one(
            {"_id": ObjectId(group_id)},
            update={
                "$set": {
                    "owner_id": str(user_id),
                },
                "$push": {
                    "admins": {
                        "admin_id": str(previous_owner_id),
                        "promoted_at": datetime.now(),
                    }
                },
            },
        )

    async def invite_member(
        self, user_email: str, group_id: str, role: str
    ) -> list:
        user_collection = self.database.get_collection("users")
        group_collection = self.database.get_collection("groups")
        user = await user_collection.find_one({"email": user_email})
        group = await group_collection.find_one({"_id": ObjectId(group_id)})
        is_member = await self.is_member(user["_id"], group_id)
        is_admin = await self.is_admin(user["_id"], group_id)
        is_invited = await self.is_invited(user["_id"], group_id)
        if (
            is_invited
            or is_member
            or is_admin
            or str(user["_id"]) == group["owner_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current user was already invited or joined this group",
            )

        await group_collection.update_one(
            {"_id": ObjectId(group_id)},
            update={
                "$push": {
                    "invited_members": {
                        "invited_id": str(user["_id"]),
                        "role": role,
                    }
                },
            },
        )

        if config.IS_TEST_ENVIRONMENT:
            invitation_link = f"https://test.hearify.org/join_group/{group_id}/{str(user['_id'])}"
        else:
            invitation_link = f"https://app.hearify.org/join_group/{group_id}/{str(user['_id'])}"

        return [user["email"], invitation_link]

    async def accept_member(self, user_id: str, group_id: str) -> bool:
        user_collection = self.database.get_collection("users")
        group_collection = self.database.get_collection("groups")
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        group = await group_collection.find_one({"_id": ObjectId(group_id)})
        is_member = await self.is_member(user_id, group_id)
        is_admin = await self.is_admin(user_id, group_id)
        is_invited = await self.is_invited(user_id, group_id)
        if is_invited or is_member or is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current user was not invited to this group or already joined it",
            )
        current_invite = {}
        for invite in group["invited_members"]:
            if str(user_id) == invite["invited_id"]:
                current_invite = invite

        await group_collection.update_one(
            {"_id": ObjectId(group_id)},
            update={"$pull": {"invited_members": {"invited_id": str(user_id)}}},
        )
        if current_invite["role"] in ["Member", "member"]:
            await group_collection.update_one(
                {"_id": ObjectId(group_id)},
                update={
                    "$push": {
                        "members": {
                            "member_id": str(user_id),
                            "joined_at": datetime.now(),
                        }
                    }
                },
            )
        elif current_invite["role"] in ["Admin", "admin"]:
            await self.set_admin(user_id=str(user_id), group_id=str(group_id))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unknown role",
            )
        return True

    async def update_group(self, group_id: str, data: GroupUpdate) -> ObjectId:
        collection = self.database.get_collection("groups")
        group = await collection.update_one(
            filter={"_id": ObjectId(group_id)},
            update={
                "$set": {**data.model_dump(), "updated_at": datetime.now()}
            },
        )
        return ObjectId(group_id)

    async def assign_quizzes(
        self, group_id: str, quizzes: GroupAssignQuiz
    ) -> None:
        collection = self.database.get_collection("groups")
        group = await collection.find_one({"_id": ObjectId(group_id)})

        cleaned_quizzes = []
        for quiz in quizzes.dict()["quiz_id"]:
            cleaned_quizzes.append(
                {"quiz_id": quiz, "assigned_at": datetime.now()}
            )

        # Remove quizzes which have already been assigned
        for quiz in group["assigned_quizzes"]:
            for cleaned_quiz in cleaned_quizzes:
                if str(quiz["quiz_id"]) in cleaned_quiz["quiz_id"]:
                    cleaned_quizzes.remove(cleaned_quiz)

        for cleaned_quiz in cleaned_quizzes:
            await collection.update_one(
                {"_id": ObjectId(group_id)},
                update={"$push": {"assigned_quizzes": cleaned_quiz}},
            )

    async def delete_group(self, group_id: str) -> None:
        collection = self.database.get_collection("groups")
        await collection.delete_one(filter={"_id": ObjectId(group_id)})

    async def leave_group(self, group_id: str, user_id: str) -> None:
        group_collection = self.database.get_collection("groups")
        await group_collection.update_one(
            {"_id": ObjectId(group_id)},
            update={
                "$pull": {"members": {"member_id": str(user_id)}},
            },
        )

    async def remove_admin(self, user_id: str, group_id: str) -> None:
        group_collection = self.database.get_collection("groups")
        await group_collection.update_one(
            {"_id": ObjectId(group_id)},
            update={
                "$pull": {"admins": {"admin_id": str(user_id)}},
                "$push": {
                    "members": {
                        "member_id": str(user_id),
                        "joined_at": datetime.now(),
                    }
                },
            },
        )

    async def remove_member(self, user_id: str, group_id: str) -> None:
        group_collection = self.database.get_collection("groups")
        await group_collection.update_one(
            {"_id": ObjectId(group_id)},
            update={"$pull": {"members": {"member_id": str(user_id)}}},
        )

    async def remove_quizzes(self, group_id, quizzes: GroupRemoveQuiz) -> None:
        collection = self.database.get_collection("groups")

        for quiz_id in quizzes.dict()["quiz_id"]:
            await collection.update_one(
                {"_id": ObjectId(group_id)},
                update={"$pull": {"assigned_quizzes": {"quiz_id": quiz_id}}},
            )
