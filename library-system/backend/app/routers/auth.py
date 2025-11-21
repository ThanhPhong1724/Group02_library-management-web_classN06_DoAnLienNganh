from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.user import User
from ..schemas.auth import (
    LoginRequest,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenPair,
)
from ..security.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    exists = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail={"error": {"code": "DUPLICATE", "message": "Email already registered", "details": {}}})

    u = User(
        email=payload.email,
        mat_khau_hash=hash_password(payload.password),
        ho_ten=payload.full_name,
        vai_tro="user",
        loai_nguoi_dung="student",
        hoat_dong=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return RegisterResponse(id=u.id, email=u.email, full_name=u.ho_ten, role=u.vai_tro)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    u = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if not u or not verify_password(payload.password, u.mat_khau_hash):
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Email or password incorrect", "details": {}}})
    access = create_access_token(u.id, u.vai_tro, u.loai_nguoi_dung)
    refresh = create_refresh_token(u.id, u.vai_tro, u.loai_nguoi_dung)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_TOKEN", "message": "Invalid refresh token", "details": {}}})
    user_id = int(data.get("sub"))
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_USER", "message": "User not found", "details": {}}})
    access = create_access_token(u.id, u.vai_tro, u.loai_nguoi_dung)
    refresh = create_refresh_token(u.id, u.vai_tro, u.loai_nguoi_dung)
    return TokenPair(access_token=access, refresh_token=refresh)


def get_current_user_from_bearer(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    data = decode_token(token)
    if not data or data.get("type") != "access":
        raise HTTPException(status_code=401, detail={"error": {"code": "UNAUTHORIZED", "message": "Invalid token", "details": {}}})
    user_id = int(data.get("sub"))
    u = db.get(User, user_id)
    if not u or not u.hoat_dong:
        raise HTTPException(status_code=401, detail={"error": {"code": "UNAUTHORIZED", "message": "User inactive", "details": {}}})
    return u


# Sửa GET /me trả về cả số điện thoại và địa chỉ
@router.get("/me")
def me(u: User = Depends(get_current_user_from_bearer)):
    return {
        "id": u.id,
        "email": u.email,
        "full_name": u.ho_ten,
        "role": u.vai_tro,
        "user_type": u.loai_nguoi_dung,
        "is_active": bool(u.hoat_dong),
        "so_dien_thoai": u.so_dien_thoai,
        "dia_chi": u.dia_chi,
    }

# Thêm PUT /me để cập nhật số điện thoại và địa chỉ
@router.put("/me")
def update_me(payload: dict, u: User = Depends(get_current_user_from_bearer), db: Session = Depends(get_db)):
    if "full_name" in payload or "ho_ten" in payload:
        u.ho_ten = payload.get("full_name") or payload.get("ho_ten")
    if "so_dien_thoai" in payload:
        u.so_dien_thoai = payload["so_dien_thoai"]
    if "dia_chi" in payload:
        u.dia_chi = payload["dia_chi"]
    if "email" in payload:
        u.email = payload["email"]
    db.add(u)
    db.commit()
    db.refresh(u)
    return {
        "id": u.id,
        "email": u.email,
        "full_name": u.ho_ten,
        "role": u.vai_tro,
        "user_type": u.loai_nguoi_dung,
        "is_active": bool(u.hoat_dong),
        "so_dien_thoai": u.so_dien_thoai,
        "dia_chi": u.dia_chi,
    }


