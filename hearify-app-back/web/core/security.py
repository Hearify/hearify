import datetime

import bcrypt

from jose import jwt, JWTError
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import JWT_SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, AUDIENCE


async def hash_password(password: str) -> str:
    """Async wrapper for bcrypt operation"""

    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


async def verify_password(password: str, hashed: str) -> bool:
    """"""

    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


async def create_access_token(data: dict) -> str:
    """"""

    to_encode = data.copy()

    to_encode.update({
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    })

    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)


async def decode_access_token(token: str):
    """"""
    try:
        decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM], audience=AUDIENCE)

    except jwt.JWSError:

        return None

    return decoded_jwt


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)

        exp = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid auth token"
        )

        if credentials:
            try:
                token = await decode_access_token(credentials.credentials)
            except JWTError as _:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid auth token"
                )

            if token is None:
                raise exp

            return credentials.credentials

        else:
            raise exp
