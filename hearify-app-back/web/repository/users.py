from typing import Optional

import arrow
import secrets

import datetime

from bson import ObjectId

from core.security import hash_password
from repository.base import BaseRepository
from schemas.user import UserCreate, UserDB


class UserRepository(BaseRepository):

    async def get_by_id(self, user_id: str) -> UserDB | None:
        """"""
        collection = self.database.get_collection("users")
        user = await collection.find_one({"_id": ObjectId(user_id)})

        if user:
            user["id"] = str(user.pop("_id"))
            return UserDB(**user)

    async def get_by_field(self, field: str, value: any) -> UserDB | None:
        """"""

        collection = self.database.get_collection("users")
        raw_user = await collection.find_one({field: value})

        if raw_user:
            raw_user["id"] = str(raw_user.pop("_id"))
            try:
                if raw_user["subscription_id"]:
                    raw_user["subscription_id"] = str(
                        raw_user.pop("subscription_id")
                    )
            except KeyError:
                return UserDB(**raw_user)
            return UserDB(**raw_user)

    async def get_user_subscription(
        self, paddle_subscription_id: str | None
    ) -> str:
        if not paddle_subscription_id:
            return "Free"
        collection = self.database.get_collection("subscriptions")
        subscription = await collection.find_one(
            {"paddle_subscription_id": paddle_subscription_id}
        )
        if not subscription:
            return "Free"
        return subscription["name"]

    async def refill_user_credits(
        self, user_subscription: str, db_user, users_repo
    ) -> bool | str:
        if (
            arrow.utcnow() - arrow.get(db_user.credits_refill_at)
        ) > datetime.timedelta(days=30):
            if user_subscription == "Free":
                if db_user.email_verified:
                    await users_repo.update_user(
                        user_id=db_user.id,
                        payload={
                            "credits": 30,
                            "credits_refill_at": datetime.datetime.utcnow(),
                        },
                    )
                else:
                    await users_repo.update_user(
                        user_id=db_user.id,
                        payload={
                            "credits": 5,
                            "credits_refill_at": datetime.datetime.utcnow(),
                        },
                    )
            elif user_subscription == "Basic":
                await users_repo.update_user(
                    user_id=db_user.id,
                    payload={
                        "credits": 250,
                        "credits_refill_at": datetime.datetime.utcnow(),
                    },
                )
            elif user_subscription == "Premium":
                await users_repo.update_user(
                    user_id=db_user.id,
                    payload={
                        "credits": 1000,
                        "credits_refill_at": datetime.datetime.utcnow(),
                    },
                )
            elif user_subscription == "Max":
                await users_repo.update_user(
                    user_id=db_user.id,
                    payload={
                        "credits": 0,
                        "credits_refill_at": datetime.datetime.utcnow(),
                    },
                )
            else:
                return "Not found"
            return True
        return False

    async def connect_user_credits(
        self, user_subscription: str, db_user, users_repo
    ):
        user_subscription_text = await users_repo.get_user_subscription(
            user_subscription
        )
        if user_subscription_text == "Free":
            if db_user.email_verified:
                await users_repo.update_user(
                    user_id=db_user.id,
                    payload={
                        "credits": 30,
                        "subscription_id": user_subscription,
                        "credits_refill_at": datetime.datetime.utcnow(),
                    },
                )
            else:
                await users_repo.update_user(
                    user_id=db_user.id,
                    payload={
                        "credits": 5,
                        "subscription_id": user_subscription,
                        "credits_refill_at": datetime.datetime.utcnow(),
                    },
                )
        elif user_subscription_text == "Basic":
            await users_repo.update_user(
                user_id=db_user.id,
                payload={
                    "credits": 250,
                    "subscription_id": user_subscription,
                    "credits_refill_at": datetime.datetime.utcnow(),
                },
            )
        elif user_subscription_text == "Premium":
            await users_repo.update_user(
                user_id=db_user.id,
                payload={
                    "credits": 1000,
                    "subscription_id": user_subscription,
                    "credits_refill_at": datetime.datetime.utcnow(),
                },
            )
        elif user_subscription_text == "Max":
            await users_repo.update_user(
                user_id=db_user.id,
                payload={
                    "credits": 0,
                    "subscription_id": user_subscription,
                    "credits_refill_at": datetime.datetime.utcnow(),
                },
            )
        else:
            return "Not found"
        return True

    async def create_user(self, user: UserCreate) -> UserDB:
        """"""
        collection = self.database.get_collection("users")
        hashed_password = await hash_password(password=user.password)

        user_payload = {
            **user.model_dump(),
            "email_verified": False,
            "subscription_id": None,
            "credits": 5,
            "credits_refill_at": datetime.datetime.utcnow(),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "hashed_password": hashed_password,
        }

        user_payload.pop("password")

        user = await collection.insert_one(user_payload)

        db_user = await collection.find_one({"_id": user.inserted_id})
        db_user["id"] = str(db_user.pop("_id"))
        return UserDB(**db_user)

    async def create_email_user(
        self,
        user_email: str,
    ):
        collection = self.database.get_collection("users")
        new_password = secrets.token_hex(16)
        hashed_password = await hash_password(password=new_password)
        user_payload = {
            "email": user_email,
            "email_verified": False,
            "subscription_id": None,
            "credits": 15,
            "credits_refill_at": datetime.datetime.utcnow(),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "is_verified": False,
            "hashed_password": hashed_password,
        }
        user = await collection.insert_one(user_payload)
        db_user = await collection.find_one({"_id": user.inserted_id})
        db_user["id"] = str(db_user.pop("_id"))
        return [UserDB(**db_user), new_password]

    async def update_user(
        self,
        payload: dict,
        user_id: ObjectId,
    ) -> UserDB:
        """"""
        collection = self.database.get_collection("users")

        await collection.update_one(
            filter={"_id": user_id},
            update={"$set": {**payload, "updated_at": str(arrow.utcnow())}},
        )

        user = await collection.find_one({"_id": user_id})
        user["id"] = user.pop("_id")
        try:
            if user["subscription_id"]:
                user["subscription_id"] = str(user.pop("subscription_id"))
        except KeyError:
            return UserDB(**user)
        return UserDB(**user)

    async def create_user_by_oauth(
        self,
        email: str,
        first_name: str,
        surname: str | None,
    ) -> UserDB:
        collection = self.database.get_collection("users")

        user_payload = {
            "email": email.lower(),
            "email_verified": True,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "hashed_password": None,
            "enable_mailing": False,
            "first_name": first_name,
            "surname": surname,
            "subscription_id": None,
            "credits": 30,
            "credits_refill_at": datetime.datetime.utcnow(),
        }

        try:
            await collection.update_one(
                filter={**user_payload},
                update={"$set": {**user_payload}},
                upsert=True,
            )
        except:
            # avoiding duplicates
            pass

        db_user = await collection.find_one({"email": email})
        db_user["id"] = str(db_user.pop("_id"))
        try:
            if db_user["subscription_id"]:
                db_user["subscription_id"] = str(db_user.pop("subscription_id"))
        except KeyError:
            return UserDB(**db_user)
        return UserDB(**db_user)
