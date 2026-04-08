import datetime
import secrets

import arrow

from bson import ObjectId
import jwt
from supabase import create_client, Client
from fastapi import APIRouter, Depends, HTTPException, status, Request

from core import config
from ext.texts import one_time_code
from ext.functions import generate_code
from tasks.tasks import task_send_email
from ext.two_fa import TwoFA, TwoFAStates
from schemas.user import UserCreate, UserDB
from repository.users import UserRepository
from core.security import (
    verify_password,
    create_access_token,
    hash_password,
    decode_access_token,
)
from api.dependencies import (
    get_user_repository,
    get_current_user,
    get_database,
    get_subscriptions_repository,
)
from schemas.auth import (
    LoginRequest,
    AuthResponse,
    SendCodeRequest,
    CodeRequest,
    ChangePassword,
    UserPublic,
)
from utils import split_fullname_to_dict
from repository.subscriptions import SubscriptionsRepository

router = APIRouter()

url: str = config.SUPABASE_URL
key: str = config.SUPABASE_KEY
supabase: Client = create_client(url, key)


@router.post("/login")
async def auth(
    login: LoginRequest,
    users_repo: UserRepository = Depends(get_user_repository),
):
    """"""

    db_user = await users_repo.get_by_field(
        field="email", value=login.email.lower()
    )

    if not db_user:
        raise HTTPException(
            detail="User with such email does not exist",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    password_verified = await verify_password(
        login.password, db_user.hashed_password
    )

    if not password_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
        )

    token = await create_access_token({"sub": str(db_user.id)})
    user_subscription = await users_repo.get_user_subscription(
        db_user.subscription_id
    )
    credit_refill = await users_repo.refill_user_credits(
        user_subscription, db_user, users_repo
    )
    if credit_refill == "Not found":
        raise HTTPException(
            status_code=400, detail="Current subcription does not exist"
        )

    return {"access_token": token, "token_type": "Bearer", "user": db_user}


@router.post("/register")
async def register(
    user: UserCreate, users_repo: UserRepository = Depends(get_user_repository)
):
    """"""

    db_user = await users_repo.get_by_field(field="email", value=user.email)

    if db_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    user.email = user.email.lower()
    user = await users_repo.create_user(user=user)

    if config.TWO_FA_ENABLED:
        two_fa = TwoFA(user_id=str(user.id))

        await two_fa.initialize_process(email=user.email)

    token = await create_access_token({"sub": str(user.id)})

    return {"access_token": token, "token_type": "Bearer", "user": user}


@router.post("/register/email")
async def email_register(
    user_email: str, users_repo: UserRepository = Depends(get_user_repository)
):
    user_email = user_email.lower()
    db_user = await users_repo.get_by_field(field="email", value=user_email)
    if db_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )
    user = await users_repo.create_email_user(user_email=user_email)
    token = await create_access_token({"sub": str(user[0].id)})
    task_send_email.delay(
        [user_email],
        "Thank you for the registration.",
        f"Your temporary password is: {str(user[1])}\n"
        "Please change your password as soon as you can.",
    )

    if config.TWO_FA_ENABLED:
        two_fa = TwoFA(user_id=str(user[0].id))

        await two_fa.initialize_process(email=user_email)

    return {"access_token": token, "token_type": "Bearer", "user": user[0]}


@router.post("/send_code")
async def send_code(
    request: SendCodeRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    """"""
    two_fa = TwoFA(user_id=request.user_id)
    current_state = await two_fa.get_current_state()

    # state checking
    if current_state not in {TwoFAStates.S1.value, TwoFAStates.S2.value}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    user = await user_repo.get_by_id(user_id=request.user_id)

    generated_code = generate_code(length=8)

    # send code to the email
    task_send_email.delay(
        [user.email],
        "Confirm Your Email for Hearify Quiz Generator",
        one_time_code.format(generated_code=generated_code, url=config.FRONTEND_URL),
    )

    await two_fa.set_code(code=generated_code)

    return {"success": True}


@router.post("/two-fa", response_model=AuthResponse)
async def two_factor_auth(
    request: CodeRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    """"""
    two_fa = TwoFA(user_id=request.user_id)

    two_fa_data = await two_fa.rclient.hgetall(f"user_id:{request.user_id}")

    if two_fa_data.get("two_fa_state") not in {TwoFAStates.S2.value}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have no access to this resource",
        )

    attempts, start_time = [
        int(two_fa_data.get("attempts")),
        arrow.get(two_fa_data.get("two_fa_start_time")),
    ]

    if start_time.shift(minutes=config.TWO_FA_CODE_LIFETIME) < arrow.utcnow():
        await two_fa.set_state(state=TwoFAStates.S1.value)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The one-time code has expired. Try to create a new one.",
        )

    if attempts >= 3:
        await two_fa.set_state(state=TwoFAStates.S1.value)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Too many attempts"
        )

    code_valid = await two_fa.is_code_valid(code=request.code)

    if not code_valid:
        await two_fa.increase_attempts()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code is not correct",
        )

    # end 2fa process
    await two_fa.end_two_fa_process()

    db_user = await user_repo.get_by_id(user_id=request.user_id)

    if not db_user.email_verified:
        db_user = await user_repo.update_user(
            user_id=db_user.id,
            payload={"email_verified": True, "credits": 30},
        )

    token = await create_access_token({"sub": str(db_user.id)})

    return {
        "user": db_user,
        "access_token": token,
        "token_type": "Bearer",
    }


@router.post(
    "/password",
    response_model=UserPublic,
)
async def change_password(
    request: ChangePassword,
    database=Depends(get_database),
    current_user: UserDB = Depends(get_current_user),
):
    """"""

    password_correct = await verify_password(
        password=request.old_password,
        hashed=current_user.hashed_password,
    )

    if not password_correct:
        raise HTTPException(status_code=401, detail="Incorrect credentials")

    if request.new_password == request.old_password:
        raise HTTPException(
            status_code=400, detail="New password should be different"
        )

    new_hashed = await hash_password(password=request.new_password)

    await database["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"hashed_password": new_hashed}},
    )

    return current_user


@router.get("/login/google")
async def google_login():
    data = supabase.auth.sign_in_with_oauth(
        {
            "provider": "google",
            "options": {"redirect_to": f"{config.FRONTEND_URL}/oauth/callback"},
        }
    )
    return data


@router.get("/login/facebook")
async def facebook_login():
    data = supabase.auth.sign_in_with_oauth(
        {
            "provider": "facebook",
            "options": {"redirect_to": f"{config.FRONTEND_URL}/oauth/callback"},
        }
    )
    return data


@router.post("/oauth/callback")
async def handle_oauth_login(
    token: str, user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        decoded_token = await decode_access_token(token)
        user_email = decoded_token["email"]

        user_id = decoded_token["sub"]
        print("id info: ", user_id)

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid data")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=f"Invalid token.")

    db_user = await user_repo.get_by_field(field="email", value=user_email)
    user_is_new = False

    if not db_user:
        user_fullname = split_fullname_to_dict(
            decoded_token["user_metadata"]["full_name"]
        )
        db_user = await user_repo.create_user_by_oauth(
            email=user_email,
            first_name=user_fullname["first_name"],
            surname=user_fullname["surname"],
        )
        user_is_new = True
    user_subscription = await user_repo.get_user_subscription(
        db_user.subscription_id
    )
    credit_refill = await user_repo.refill_user_credits(
        user_subscription, db_user, user_repo
    )
    if credit_refill == "Not found":
        raise HTTPException(
            status_code=400, detail="Current subcription does not exist"
        )

    return {
        "access_token": token,
        "token_type": "Bearer",
        "user": db_user,
        "user_is_new": user_is_new,
    }


@router.post("/reset_password/generate_link")
async def send_resend_link(
    user_email: str, users_repo: UserRepository = Depends(get_user_repository)
):
    db_user = await users_repo.get_by_field(field="email", value=user_email)
    if not db_user:
        raise HTTPException(
            detail="User with such email does not exist",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    reset_token = secrets.token_hex(32)
    await users_repo.update_user(
        user_id=db_user.id, payload={"reset_token": reset_token}
    )

    if config.IS_TEST_ENVIRONMENT:
        reset_link = f"https://test.hearify.org/reset_password/{reset_token}"
    else:
        reset_link = f"https://app.hearify.org/reset_password/{reset_token}"

    task_send_email.delay(
        [user_email], "Follow the link to reset your password", f"{reset_link}"
    )

    return {"success": True}


@router.post("/reset_password/set_new_password")
async def set_new_password(
    reset_token: str,
    new_password: str,
    users_repo: UserRepository = Depends(get_user_repository),
):
    db_user = await users_repo.get_by_field(
        field="reset_token", value=reset_token
    )
    if not db_user:
        raise HTTPException(
            detail="User with such id does not exist",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    new_hashed_password = await hash_password(password=new_password)
    await users_repo.update_user(
        user_id=db_user.id,
        payload={"hashed_password": new_hashed_password, "reset_token": ""},
    )

    return {"success": True}
