from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.misc import Setting
from ..models.policy import Policy
from ..schemas.policies import PolicyOut, PolicyUpdate
from ..schemas.settings import SettingsOut, SettingsUpdate
from ..security.deps import CurrentUser, get_current_user


router = APIRouter(prefix="", tags=["settings-policies"])


@router.get("/settings", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    rows = db.execute(select(Setting)).scalars().all()
    data = {r.khoa: r.gia_tri for r in rows}
    return SettingsOut(
        opening_hours=data.get("opening_hours"),
        rules=data.get("rules"),
        bank_info=data.get("bank_info"),
        library_name=data.get("library_name"),
        library_address=data.get("library_address"),
        library_phone=data.get("library_phone"),
        library_email=data.get("library_email"),
        library_website=data.get("library_website"),
        max_loan_days=int(data["max_loan_days"]) if data.get("max_loan_days") else None,
        max_books_per_user=int(data["max_books_per_user"]) if data.get("max_books_per_user") else None,
        fine_per_day=int(data["fine_per_day"]) if data.get("fine_per_day") else None,
        auto_renewal=data.get("auto_renewal") == "true" if data.get("auto_renewal") is not None else None,
        email_notifications=data.get("email_notifications") == "true" if data.get("email_notifications") is not None else None,
        sms_notifications=data.get("sms_notifications") == "true" if data.get("sms_notifications") is not None else None,
        maintenance_mode=data.get("maintenance_mode") == "true" if data.get("maintenance_mode") is not None else None,
        backup_frequency=data.get("backup_frequency"),
        language=data.get("language"),
        timezone=data.get("timezone"),
        date_format=data.get("date_format"),
    )


@router.put("/settings", response_model=SettingsOut)
def put_settings(payload: SettingsUpdate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    changes = payload.model_dump(by_alias=True, exclude_unset=True)
    for key, value in changes.items():
        # map field to key in table
        table_key = key
        rec = db.get(Setting, table_key)
        if rec:
            rec.gia_tri = value
        else:
            rec = Setting(khoa=table_key, gia_tri=value)
        db.add(rec)
    db.commit()
    return get_settings(db)


@router.get("/policies")
def list_policies(db: Session = Depends(get_db)):
    rows = db.execute(select(Policy)).scalars().all()
    return [
        PolicyOut(
            user_type=r.loai_nguoi_dung,
            max_loans=r.toi_da_muon,
            loan_days=r.so_ngay_muon,
            fine_per_day=float(r.phat_moi_ngay),
            renew_times=r.so_lan_gia_han,
        )
        for r in rows
    ]


@router.put("/policies/{user_type}", response_model=PolicyOut)
def update_policy(user_type: str, payload: PolicyUpdate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    p = db.execute(select(Policy).where(Policy.loai_nguoi_dung == user_type)).scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Policy not found", "details": {}}})
    data = payload.model_dump(exclude_unset=True)
    if "max_loans" in data:
        p.toi_da_muon = data["max_loans"]
    if "loan_days" in data:
        p.so_ngay_muon = data["loan_days"]
    if "fine_per_day" in data:
        p.phat_moi_ngay = data["fine_per_day"]
    if "renew_times" in data:
        p.so_lan_gia_han = data["renew_times"]
    db.add(p)
    db.commit()
    db.refresh(p)
    return PolicyOut(
        user_type=p.loai_nguoi_dung,
        max_loans=p.toi_da_muon,
        loan_days=p.so_ngay_muon,
        fine_per_day=float(p.phat_moi_ngay),
        renew_times=p.so_lan_gia_han,
    )


