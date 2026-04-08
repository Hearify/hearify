from repository.base import BaseRepository


class FileRepository(BaseRepository):

    _collection_name = "files"

    async def create_file(self, file_content: bytes):
        """"""

    async def get_by_url(self):
        """"""
