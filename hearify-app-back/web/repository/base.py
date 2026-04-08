from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection


class BaseRepository:

    _collection_name = None

    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database

    @property
    def collection(self) -> AsyncIOMotorCollection:
        return self.database[self._collection_name]

    async def raw_get_all(
        self,
        _filter: dict,
        skip: int | None,
        limit: int | None,
        sort: dict | None,
    ) -> List[dict]:
        """"""
        cursor = self.collection.find(_filter)

        if sort:
            cursor.sort(
                direction=sort["direction"], key_or_list=sort["key_or_list"]
            )

        if limit:
            cursor.limit(limit)

        if skip:
            cursor.skip(skip)

        return await cursor.to_list(length=None)
