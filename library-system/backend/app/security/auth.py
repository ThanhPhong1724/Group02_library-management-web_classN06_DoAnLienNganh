from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from ..config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def _create_token(subject: str | int, role: str, user_type: str, token_type: str, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "user_type": user_type,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    # print("DEBUG CREATE TOKEN PAYLOAD:", payload)
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    # print("DEBUG CREATE TOKEN:", token)
    return token


def create_access_token(user_id: int, role: str, user_type: str) -> str:
    return _create_token(user_id, role, user_type, "access", settings.access_token_expires_minutes)


def create_refresh_token(user_id: int, role: str, user_type: str) -> str:
    # Default refresh 7 days
    return _create_token(user_id, role, user_type, "refresh", 60 * 24 * 7)


def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        # print("DEBUG DECODE TOKEN INPUT:", token)
        data = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        # print("DEBUG DECODE TOKEN PAYLOAD:", data)
        return data
    except JWTError as e:
        # print("DEBUG DECODE TOKEN ERROR:", str(e))
        return None


