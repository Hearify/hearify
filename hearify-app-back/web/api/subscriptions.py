import json
import arrow
import httpx
import base64
import secrets
import hashlib
import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Response

from api.dependencies import get_database, get_current_user, get_user_repository
from repository.users import UserRepository
from core import config
from core.config import PADDLE_API_KEY, PADDLE_SELLER_ID, PADDLE_API_URL


router = APIRouter()


async def check_payment_status(transaction_id: str):
    url = f"{PADDLE_API_URL}{transaction_id}"
    headers = {"Authorization": f"Bearer {PADDLE_API_KEY}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response_data = response.json()
        if response_data["data"]["status"] != "completed":
            raise HTTPException(
                status_code=400, detail="Failed to retrieve payment status"
            )
        if response_data["data"]["status"] == "completed":
            return [
                True,
                response_data["data"]["items"][0]["price"]["id"],
                response_data["data"]["id"],
            ]
        return False


@router.post("/connect")
async def connect_subscription(
    order_id: str,
    user_repo: UserRepository = Depends(get_user_repository),
    database=Depends(get_database),
    current_user=Depends(get_current_user),
):
    payment_completed = await check_payment_status(order_id)
    if payment_completed:
        credit_refill = await user_repo.connect_user_credits(
            payment_completed[1], current_user, user_repo
        )
        payment = await database["payments"].insert_one(
            {
                "user_id": current_user.id,
                "subscription_id": payment_completed[1],
                "transaction_id": payment_completed[2],
                "pay_date": datetime.datetime.now(),
            }
        )
        await database["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$push": {"payments": payment.inserted_id},
            },
        )
        return {"status": "success", "message": "Subscription connected"}
    else:
        return {"status": "pending", "message": "Payment not completed yet"}
