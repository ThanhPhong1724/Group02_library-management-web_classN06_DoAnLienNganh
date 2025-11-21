from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import get_db
from ..models.misc import Rule
from ..schemas.rules import RuleOut, RuleCreate, RuleUpdate
from ..security.deps import get_current_user, CurrentUser
from sqlalchemy import select, or_, desc

router = APIRouter(prefix="/api/rules", tags=["rules"])

@router.get("", response_model=List[RuleOut])
def list_rules(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    applies_to: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Rule)
    if search:
        q = q.filter(or_(Rule.tieu_de.ilike(f"%{search}%"), Rule.mo_ta.ilike(f"%{search}%")))
    if category and category != "all":
        q = q.filter(Rule.danh_muc == category)
    if status and status != "all":
        q = q.filter(Rule.trang_thai == status)
    if priority and priority != "all":
        q = q.filter(Rule.muc_do == priority)
    if applies_to and applies_to != "all":
        q = q.filter(Rule.doi_tuong == applies_to)
    total = q.count()
    items = q.order_by(desc(Rule.tao_luc)).offset((page-1)*limit).limit(limit).all()
    return items

@router.post("", response_model=RuleOut)
def create_rule(payload: RuleCreate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    rule = Rule(**payload.dict(), nguoi_tao=user.full_name if hasattr(user, 'full_name') else user.user_id)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.put("/{rule_id}", response_model=RuleOut)
def update_rule(rule_id: int, payload: RuleUpdate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    rule = db.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(rule, k, v)
    rule.nguoi_cap_nhat = user.full_name if hasattr(user, 'full_name') else user.user_id
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{rule_id}")
def delete_rule(rule_id: int, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    rule = db.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"ok": True}
