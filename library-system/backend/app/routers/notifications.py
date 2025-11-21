from typing import List

from fastapi import APIRouter, Depends, HTTPException, Body, Path
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.misc import Notification
from ..schemas.notifications import NotificationOut, NotificationReadPatch, NotificationUpdate
from ..security.deps import CurrentUser, get_current_user
from pydantic import BaseModel
from ..models.user import User


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationOut])
def list_notifications(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(Notification).where(Notification.id_nguoi_dung == user.user_id).order_by(Notification.tao_luc.desc())
        )
        .scalars()
        .all()
    )
    return [
        NotificationOut(
            id=r.id,
            type=r.loai,
            title=r.tieu_de,
            body=r.noi_dung,
            is_read=bool(r.da_doc),
            created_at=r.tao_luc,
        )
        for r in rows
    ]


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, payload: NotificationReadPatch, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.get(Notification, notification_id)
    if not n or n.id_nguoi_dung != user.user_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Notification not found", "details": {}}})
    n.da_doc = bool(payload.is_read)
    db.add(n)
    db.commit()
    db.refresh(n)
    return NotificationOut(
        id=n.id,
        type=n.loai,
        title=n.tieu_de,
        body=n.noi_dung,
        is_read=bool(n.da_doc),
        created_at=n.tao_luc,
    )


class NotificationCreate(BaseModel):
    user_id: int
    type: str
    title: str
    body: str | None = None

class NotificationBroadcast(BaseModel):
    user_ids: list[int]
    type: str
    title: str
    body: str | None = None

@router.post("", response_model=NotificationOut)
def create_notification(payload: NotificationCreate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    # Only admin or system can create notification for others
    if user.user_id != payload.user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "No permission", "details": {}}})
    n = Notification(
        id_nguoi_dung=payload.user_id,
        loai=payload.type,
        tieu_de=payload.title,
        noi_dung=payload.body,
        da_doc=False,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return NotificationOut(
        id=n.id,
        type=n.loai,
        title=n.tieu_de,
        body=n.noi_dung,
        is_read=bool(n.da_doc),
        created_at=n.tao_luc,
    )

@router.post("/broadcast", response_model=list[NotificationOut])
def broadcast_notification(payload: NotificationBroadcast, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "No permission", "details": {}}})
    notifications = []
    for uid in payload.user_ids:
        n = Notification(
            id_nguoi_dung=uid,
            loai=payload.type,
            tieu_de=payload.title,
            noi_dung=payload.body,
            da_doc=False,
        )
        db.add(n)
        notifications.append(n)
    db.commit()
    return [
        NotificationOut(
            id=n.id,
            type=n.loai,
            title=n.tieu_de,
            body=n.noi_dung,
            is_read=bool(n.da_doc),
            created_at=n.tao_luc,
        ) for n in notifications
    ]

class SystemNotificationRequest(BaseModel):
    type: str
    title: str
    body: str
    user_type: str = "all"

@router.post("/system", response_model=list[NotificationOut])
def send_system_notification(
    payload: SystemNotificationRequest,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    # Lấy danh sách user nhận
    if payload.user_type == "all":
        users = db.execute(select(User.id)).scalars().all()
    else:
        users = db.execute(select(User.id).where(User.loai_nguoi_dung == payload.user_type)).scalars().all()
    notifications = []
    for uid in users:
        n = Notification(
            id_nguoi_dung=uid,
            loai=payload.type,
            tieu_de=payload.title,
            noi_dung=payload.body,
            da_doc=False,
        )
        db.add(n)
        notifications.append(n)
    db.commit()
    return [
        NotificationOut(
            id=n.id,
            type=n.loai,
            title=n.tieu_de,
            body=n.noi_dung,
            is_read=bool(n.da_doc),
            created_at=n.tao_luc,
        ) for n in notifications
    ]

@router.patch("/{notification_id}", response_model=NotificationOut)
def update_notification(
    notification_id: int,
    payload: NotificationUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    n = db.get(Notification, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Notification not found", "details": {}}})
    # Chỉ admin hoặc chủ sở hữu mới được sửa
    if user.role != "admin" and n.id_nguoi_dung != user.user_id:
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "No permission", "details": {}}})
    if payload.type is not None:
        n.loai = payload.type
    if payload.title is not None:
        n.tieu_de = payload.title
    if payload.body is not None:
        n.noi_dung = payload.body
    db.add(n)
    db.commit()
    db.refresh(n)
    return NotificationOut(
        id=n.id,
        type=n.loai,
        title=n.tieu_de,
        body=n.noi_dung,
        is_read=bool(n.da_doc),
        created_at=n.tao_luc,
    )

@router.delete("/{notification_id}", response_model=dict)
def delete_notification(
    notification_id: int,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    n = db.get(Notification, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Notification not found", "details": {}}})
    # Chỉ admin hoặc chủ sở hữu mới được xóa
    if user.role != "admin" and n.id_nguoi_dung != user.user_id:
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "No permission", "details": {}}})
    db.delete(n)
    db.commit()
    return {"success": True, "id": notification_id}

@router.get("/unread-count", response_model=int)
def unread_count(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Notification).filter(
        Notification.id_nguoi_dung == user.user_id,
        Notification.da_doc == False
    ).count()
    return count

@router.patch("/mark-all-read", response_model=int)
def mark_all_read(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = db.query(Notification).filter(
        Notification.id_nguoi_dung == user.user_id,
        Notification.da_doc == False
    ).update({Notification.da_doc: True})
    db.commit()
    return updated


