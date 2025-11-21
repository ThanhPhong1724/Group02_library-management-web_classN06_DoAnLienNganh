from fastapi import Header, HTTPException, Request
from ..security.auth import decode_token
from ..models.user import User
from sqlalchemy.orm import Session
from fastapi import Depends
from ..db import get_db


class CurrentUser:
    def __init__(self, user_id: int, role: str, email: str, user_type: str = "student", full_name: str = ""):
        self.user_id = user_id
        self.role = role
        self.email = email
        self.user_type = user_type
        self.full_name = full_name

async def get_current_user(
    request: Request,
    x_user_id: int | None = Header(default=None, alias="X-User-Id"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_type: str | None = Header(default=None, alias="X-User-Type"),
    db: Session = Depends(get_db),
) -> CurrentUser:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        data = decode_token(token)
        if not data or "sub" not in data or "role" not in data:
            raise HTTPException(status_code=401, detail={"error": {"code": "INVALID_TOKEN", "message": "Invalid or expired token", "details": {}}})
        user_id = int(data["sub"])
        role = data["role"].lower()
        email = data.get("email", "")
        user_type = data.get("user_type") or data.get("loai_nguoi_dung") or "student"
        # Lấy full_name từ DB
        user_obj = db.query(User).filter(User.id == user_id).first()
        full_name = user_obj.ho_ten if user_obj else ""
        return CurrentUser(user_id=user_id, role=role, email=email, user_type=user_type, full_name=full_name)
    # Fallback cho dev: lấy từ header custom
    user_id = x_user_id if x_user_id is not None else 2
    role = (x_user_role or "user").lower()
    if role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_ROLE", "message": "Role must be user|admin", "details": {}}})
    user_type = x_user_type or "student"
    # Lấy full_name từ DB nếu có
    full_name = ""
    if user_id:
        user_obj = db.query(User).filter(User.id == user_id).first()
        full_name = user_obj.ho_ten if user_obj else ""
    return CurrentUser(user_id=user_id, role=role, email=x_user_email, user_type=user_type, full_name=full_name)


