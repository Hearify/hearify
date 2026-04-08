import os
import time
import asyncio
import requests

from fastapi import Depends
from dotenv import load_dotenv

from dependency_injector.providers import ThreadSafeSingleton
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DATABASE = os.getenv("MONGO_INITDB_DATABASE", default="hearify_db")
WEBSHARE_TOKEN = os.getenv("WEBSHARE_TOKEN")


def get_db() -> AsyncIOMotorDatabase:
    client = AsyncIOMotorClient(
        MONGODB_URL, tls=True, tlsAllowInvalidCertificates=True
    )
    return client.get_database(MONGODB_DATABASE)


def get_database() -> AsyncIOMotorDatabase:
    """"""
    return DatabaseProvider()


DatabaseProvider: AsyncIOMotorDatabase = ThreadSafeSingleton(get_db)


async def refill_proxies():
    database = get_database()
    await database["proxies"].delete_many({})
    active_clear_proxies = []
    webshare_response = requests.get(
        "https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=25",
        headers={"Authorization": WEBSHARE_TOKEN},
    )
    webshare_proxies_data = webshare_response.json()

    proxies_db = await database["proxies"].find().to_list(length=None)
    for proxie_db in proxies_db:
        active_clear_proxies.append(proxie_db["proxie"])

    for webshare_proxie in webshare_proxies_data["results"]:
        webshare_proxie = f"http://{webshare_proxie['username']}:{webshare_proxie['password']}@{webshare_proxie['proxy_address']}:{webshare_proxie['port']}"
        if webshare_proxie not in active_clear_proxies:
            await database["proxies"].insert_one(
                {"proxie": webshare_proxie, "is_valid": True}
            )


loop = asyncio.get_event_loop()

while True:
    loop.run_until_complete(refill_proxies())
    time.sleep(12 * 3600)

if __name__ == "__main__":
    asyncio.run(refill_proxies())
