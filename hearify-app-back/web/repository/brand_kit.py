from bson import ObjectId

from repository.base import BaseRepository
from schemas.brand_kit import BrandKit, DBBrandKit, BrandKitDTO


class BrandKitRepository(BaseRepository):

    async def get_by_user_id(self, user_id: str) -> DBBrandKit | None:

        collection = self.database.get_collection("brand_kit")
        brand_kit = await collection.find_one({"user_id": ObjectId(user_id)})

        if brand_kit:
            brand_kit["id"] = str(brand_kit.pop("_id"))
            return DBBrandKit(**brand_kit)


    async def get_by_user_id_to_dto(self, user_id: str) -> BrandKitDTO | None:
        db_brand_kit = await self.get_by_user_id(user_id)

        if db_brand_kit:
            db_brand_kit = dict(db_brand_kit)

            del db_brand_kit["id"]
            del db_brand_kit["user_id"]

            return BrandKitDTO(**db_brand_kit)

    async def save(self, brand_kit: BrandKit) -> DBBrandKit:

        collection = self.database.get_collection("brand_kit")

        brand_kit_payload = {
            **brand_kit.model_dump()
        }

        new_brand_kit = await collection.insert_one(brand_kit_payload)

        db_brand_kit = await collection.find_one({"_id": new_brand_kit.inserted_id})
        db_brand_kit["id"] = str(db_brand_kit.pop("_id"))

        return DBBrandKit(**db_brand_kit)

    async def update_by_user_id(self, user_id: str, brand_kit: BrandKit) -> int:

        collection = self.database.get_collection("brand_kit")

        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {**brand_kit.model_dump()}}
        )

        return result.modified_count

    async def delete_all_by_user_id(self, user_id: str) -> int:

        collection = self.database.get_collection("brand_kit")

        result = await collection.delete_many(
            {"user_id": ObjectId(user_id)}
        )

        return result.deleted_count

    async def get_default_brand_kit(self) -> BrandKitDTO:
        collection = self.database.get_collection("brand_kit")

        default_brand_kit = await collection.find_one({"_id": ObjectId('664287a1bd9ec44a54c81706')})
        del default_brand_kit["_id"]

        return BrandKitDTO(**default_brand_kit)

    async def update_logo_by_user_id(self, user_id: str, logo_url: str) -> int:
        collection = self.database.get_collection("brand_kit")

        result = await collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"logo_url": logo_url}}
        )

        return result.modified_count