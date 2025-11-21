from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.user import User
from ..schemas.auth import RegisterRequest
from ..security.auth import hash_password
from ..models.misc import create_notification

router = APIRouter(prefix="/users", tags=["users"])

# List users (admin)
@router.get("", response_model=List[dict])
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(User)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            func.lower(User.ho_ten).like(func.lower(like)) |
            func.lower(User.email).like(func.lower(like)) |
            func.lower(User.so_dien_thoai).like(func.lower(like))
        )
    if role and role != "all":
        stmt = stmt.where(User.vai_tro == role)
    if status and status != "all":
        if status == "active":
            stmt = stmt.where(User.hoat_dong == True)
        elif status == "inactive":
            stmt = stmt.where(User.hoat_dong == False)
        elif status == "suspended":
            stmt = stmt.where(User.banned == True)
    if user_type and user_type != "all":
        stmt = stmt.where(User.loai_nguoi_dung == user_type)
    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar()
    items = db.execute(stmt.order_by(User.id.desc()).offset((page-1)*limit).limit(limit)).scalars().all()
    return [{
        "id": u.id,
        "full_name": u.ho_ten,
        "email": u.email,
        "phone": u.so_dien_thoai,
        "address": u.dia_chi,
        "role": u.vai_tro,
        "user_type": u.loai_nguoi_dung,
        "created_at": u.tao_luc.isoformat() if u.tao_luc else None,
        "last_login": u.dang_nhap_cuoi.isoformat() if hasattr(u, 'dang_nhap_cuoi') and u.dang_nhap_cuoi else None,
        "status": "active" if u.hoat_dong else ("suspended" if getattr(u, 'banned', False) else "inactive"),
        "loan_count": 0, # TODO: join count
        "overdue_count": 0 # TODO: join count
    } for u in items]

# Create user (admin)
@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(payload: dict, db: Session = Depends(get_db)):
    exists = db.execute(select(User).where(User.email == payload.get('email'))).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    u = User(
        email=payload.get('email'),
        mat_khau_hash=hash_password(payload.get('password')),
        ho_ten=payload.get('full_name'),
        vai_tro=payload.get('role', 'user'),
        loai_nguoi_dung=payload.get('user_type', 'student'),
        so_dien_thoai=payload.get('phone'),
        dia_chi=payload.get('address'),
        hoat_dong=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"id": u.id}

# Update user (admin)
@router.put("/{user_id}")
def update_user(user_id: int, payload: dict, db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in payload.items():
        if k == "password":
            setattr(u, "mat_khau_hash", hash_password(v))
        elif k == "phone":
            setattr(u, "so_dien_thoai", v)
        elif k == "address":
            setattr(u, "dia_chi", v)
        elif hasattr(u, k):
            setattr(u, k, v)
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"id": u.id}

# Delete user (admin)
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u)
    db.commit()
    return {"ok": True}

# Change status (active/inactive/suspended)
@router.patch("/{user_id}/status")
def change_status(user_id: int, status: str, db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if status == "active":
        u.hoat_dong = True
        u.banned = False
        db.add(u)
        db.commit()
        # Thông báo mở khóa tài khoản
        create_notification(db, u.id, "account_unlocked", "Tài khoản đã được mở khóa", "Tài khoản của bạn đã được mở khóa và có thể sử dụng bình thường.")
    elif status == "inactive":
        u.hoat_dong = False
        u.banned = False
        db.add(u)
        db.commit()
        # Thông báo vô hiệu hóa tài khoản
        create_notification(db, u.id, "account_inactive", "Tài khoản bị vô hiệu hóa", "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên nếu có thắc mắc.")
    elif status == "suspended":
        u.hoat_dong = False
        u.banned = True
        db.add(u)
        db.commit()
        # Thông báo khóa tài khoản
        create_notification(db, u.id, "account_locked", "Tài khoản bị khóa", "Tài khoản của bạn đã bị khóa do vi phạm quy định hoặc quá hạn trả sách. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.")
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
    return {"id": u.id, "status": status}

# Change role
@router.patch("/{user_id}/role")
def change_role(user_id: int, role: str, db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.vai_tro = role
    db.add(u)
    db.commit()
    # Thông báo đổi vai trò
    create_notification(db, u.id, "role_changed", "Thay đổi vai trò tài khoản", f"Vai trò của bạn đã được đổi thành: {role}")
    return {"id": u.id, "role": role}
