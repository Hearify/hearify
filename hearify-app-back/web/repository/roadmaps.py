from typing import List
from datetime import datetime

from bson import ObjectId
from pymongo import UpdateOne

from repository.base import BaseRepository
from schemas.quizzes import QuizBase, QuizPublic, RoadmapBase, RoadmapPublic, Subtopic, TopicPublic

from schemas.quizzes import Roles


class RoadmapRepository(BaseRepository):
    """Main repository for roadmaps collection"""
    _collection_name = "roadmaps"


    async def create(self, values: dict) -> ObjectId:
        """"""
        now_ = datetime.utcnow()
        roadmap = RoadmapBase.model_validate(values)

        for topic in roadmap.topics:
            subtopics = []
            for subtopic in topic.subtopics:
                subtopic_dict = subtopic.model_dump()

                if isinstance(subtopic_dict["name"], dict):
                    name_value = subtopic_dict["name"]
                    name_str = name_value.get("name", "")
                    description = name_value.get("description", "")
                    study_materials = name_value.get("study_materials", [])
                else:
                    name_str = subtopic_dict["name"]
                    description = subtopic_dict.get("description", "")
                    study_materials = subtopic_dict.get("study_materials", [])

                subtopic_db = await self.database["subtopics"].insert_one(
                    {
                        "class_code": roadmap.class_code,
                        "name": name_str,
                        "completed": False,
                        "description": description,
                        "quizzes": [],
                        "flashcards": [],
                        "study_materials": study_materials
                    }
                )
                subtopics.append(subtopic_db.inserted_id)
            topic.subtopics = subtopics

        roadmap_dict = roadmap.model_dump()
        roadmap_dict["topics"] = []
        for topic in roadmap.topics:
            topic_dict = topic.model_dump()
            topic_dict["subtopics"] = topic.subtopics
            roadmap_dict["topics"].append(topic_dict)

        result = await self.collection.insert_one(
            {
                **roadmap_dict,
                "created_at": now_,
                "updated_at": now_,
                "user_id": ObjectId(roadmap.user_id),
            }
        )

        return result.inserted_id


    async def get_all(self, skip: int, limit: int, _filter: dict, sort: dict | None) -> List:
        """"""
        raw_roadmaps = await self.raw_get_all(
            sort=sort,
            skip=skip,
            limit=limit,
            _filter=_filter
        )

        validated_roadmaps = []

        for raw_roadmap in raw_roadmaps:
            topics_with_subtopics = []
            for topic in raw_roadmap["topics"]:
                validated_subtopics = await self.get_all_subtopics(topic=topic)
                topic["subtopics"] = validated_subtopics

                topics_with_subtopics.append({
                    "name": topic["name"],
                    "completed": topic["completed"],
                    "subtopics": topic["subtopics"]
                })

            roadmap_data = {
                "_id": raw_roadmap["_id"],
                "name": raw_roadmap["name"],
                "class_code": raw_roadmap["class_code"],
                "user_id": raw_roadmap["user_id"],
                "created_at": raw_roadmap["created_at"],
                "topics": topics_with_subtopics
            }

            validated_roadmaps.append(RoadmapPublic.model_validate(roadmap_data))

        return validated_roadmaps


    async def get_by_field(self, field: str, value: any) -> RoadmapPublic | None:
        """"""
        raw_roadmap = await self.collection.find_one({field: value})
        if not raw_roadmap:
            return None

        topics_public = []
        for topic_data in raw_roadmap["topics"]:
            subtopics_detailed = await self.get_all_subtopics(topic=topic_data)
            subtopics_models = [Subtopic(**s) for s in subtopics_detailed]
            topics_public.append(TopicPublic(
                name=topic_data["name"],
                completed=topic_data["completed"],
                subtopics=subtopics_models
            ))

        return RoadmapPublic(
            name=raw_roadmap["name"],
            topics=topics_public,
            class_code=raw_roadmap["class_code"],
            user_id=raw_roadmap["user_id"],
            created_at=raw_roadmap["created_at"],
        )


    async def delete_by_class_code(self, class_code: str):
        """"""
        await self.collection.delete_one({"class_code": class_code})


    async def check_owner_access(self, class_code: str, user_id: str) -> bool:
        """"""
        has_access = False

        raw_roadmap = await self.get_by_field(field="class_code", value=class_code)
        if not raw_roadmap:
            return None

        if str(raw_roadmap.user_id) == str(user_id):
            has_access = True

        return has_access


    async def get_all_subtopics(self, topic) -> List:
        """"""
        subtopics_db = []
        for subtopic in topic["subtopics"]:
            subtopic_db = await self.database["subtopics"].find_one(
                {"_id": subtopic},
            )
            subtopic_format = {
                "_id": subtopic,
                "name": subtopic_db["name"],
                "completed": subtopic_db["completed"],
                "description": subtopic_db["description"],
                "quizzes": subtopic_db["quizzes"],
                "flashcards": subtopic_db["flashcards"],
                "study_materials": subtopic_db["study_materials"]
            }
            subtopics_db.append(subtopic_format)
        return subtopics_db


    async def delete_subtopics(self, class_code: str):
        """"""
        roadmap = await self.collection.find_one({"class_code": class_code})
        if not roadmap:
            return None

        for topic in roadmap["topics"]:
            for subtopic in topic["subtopics"]:
                await self.database["subtopics"].delete_one({"_id": ObjectId(subtopic)})


    async def delete_subtopics_from_topic(self, class_code: str, topic_name: str):
        """"""
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        found_topic = await self.topic_exists(class_code=class_code, topic_name=topic_name)
        if found_topic is None:
            return None

        for subtopic in found_topic["subtopics"]:
            await self.database["subtopics"].delete_one({"_id": ObjectId(subtopic)})


    async def check_subtopic_exists(self, class_code: str, subtopic_id: str) -> bool:
        """"""
        subtopic_exists = False
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        for topic in raw_roadmap["topics"]:
            for subtopic in topic["subtopics"]:
                if str(subtopic) == str(subtopic_id):
                    subtopic_exists = True

        return subtopic_exists


    async def remove_subtopic(self, class_code: str, subtopic_id: str) -> None:
        """"""
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        for topic in raw_roadmap["topics"]:
            for subtopic in topic["subtopics"]:
                if str(subtopic) == str(subtopic_id):
                    topic["subtopics"].remove(subtopic)
                    break

        await self.collection.update_one(
            {"_id": raw_roadmap["_id"]},
            {"$set": {"topics": raw_roadmap["topics"]}}
        )


    async def add_generated_subtopic(self, class_code: str, subtopic: dict, topic_name: str) -> None:
        """"""
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        found_topic = await self.topic_exists(class_code=class_code, topic_name=topic_name)
        if found_topic is None:
            return None

        topics = []
        for topic in raw_roadmap["topics"]:
            if topic["name"] == topic_name:
                new_topic = {"name": topic["name"], "subtopics": []}

                for sub in topic["subtopics"]:
                    new_topic["subtopics"].append(sub)

                subtopic_db = await self.database["subtopics"].insert_one(
                    {
                        "class_code": class_code,
                        "name": subtopic["subtopic"],
                        "completed": False,
                        "quizzes": [],
                        "flashcards": [],
                        "study_materials": []
                    }
                )
                new_topic["subtopics"].append(subtopic_db.inserted_id)
                topics.append(new_topic)
            else:
                topics.append(topic)

        await self.collection.update_one(
            {"_id": raw_roadmap["_id"]},
            {"$set": {"topics": topics}}
        )


    async def add_regenerated_subtopics(self, class_code: str, subtopics: dict, topic_name: str) -> None:
        """"""
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        found_topic = await self.topic_exists(class_code=class_code, topic_name=topic_name)
        if found_topic is None:
            return None

        await self.delete_subtopics_from_topic(class_code=class_code, topic_name=topic_name)

        new_subtopics = []
        for sub in subtopics["subtopics"]:
            new_subtopics.append(sub)

        topics = []
        for topic in raw_roadmap["topics"]:
            if topic["name"] == topic_name:
                new_topic = {"name": topic["name"], "completed": False, "subtopics": []}

                for subtopic in new_subtopics:
                    if isinstance(subtopic, dict):
                        name = subtopic.get("name", "")
                        study_materials = subtopic.get("study_materials", [])
                    else:
                        name = subtopic
                        study_materials = []

                    subtopic_db = await self.database["subtopics"].insert_one(
                        {
                            "class_code": class_code,
                            "name": name,
                            "completed": False,
                            "quizzes": [],
                            "flashcards": [],
                            "study_materials": study_materials
                        }
                    )
                    new_topic["subtopics"].append(subtopic_db.inserted_id)

                topics.append(new_topic)
            else:
                topics.append(topic)

        await self.collection.update_one(
            {"_id": raw_roadmap["_id"]},
            {"$set": {"topics": topics}}
        )


    async def topic_exists(self, class_code: str, topic_name: str):
        """"""
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        topic = None
        for topic_db in raw_roadmap["topics"]:
            if topic_db["name"] == topic_name:
                topic = topic_db

        return topic


    async def delete_topic(self, class_code: str, topic_name: str):
        """"""
        raw_roadmap = await self.collection.find_one({"class_code": class_code})
        if not raw_roadmap:
            return None

        updated_topics = []

        for topic in raw_roadmap["topics"]:
            if topic["name"] == topic_name:
                for subtopic in topic["subtopics"]:
                    await self.database["subtopics"].delete_one({"_id": ObjectId(subtopic)})
            else:
                updated_topics.append(topic)

        await self.collection.update_one(
            {"_id": raw_roadmap["_id"]},
            {"$set": {"topics": updated_topics}}
        )