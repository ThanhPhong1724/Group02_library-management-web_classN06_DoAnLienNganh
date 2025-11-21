from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..db import get_db
from ..models.book import Book, BookImage
from ..models.copy import Copy
from ..models.location import Location
from ..schemas.copies import CopyCreate, CopyLookupOut, CopyPatch
from sqlalchemy import func


router = APIRouter(prefix="/copies", tags=["copies"])


class CopyListItem(BaseModel):
    id: int
    copy_code: str
    status: str
    book_id: int
    book_title: str
    book_authors: str
    location_id: int
    location_code: str
    location_room: Optional[str]
    location_floor: Optional[str]
    primary_image_url: Optional[str] = None
    created_at: str
    updated_at: str

class CopyListResponse(BaseModel):
    items: List[CopyListItem]
    page: int
    limit: int
    total: int


@router.post("")
def create_copy(payload: CopyCreate, db: Session = Depends(get_db)):
    # Ensure book and location exist
    if not db.get(Book, payload.book_id):
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_BOOK", "message": "Book not found", "details": {}}})
    if not db.get(Location, payload.location_id):
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_LOCATION", "message": "Location not found", "details": {}}})

    dup = db.execute(select(Copy).where(Copy.ma_ban_sao == payload.copy_code)).scalar_one_or_none()
    if dup:
        raise HTTPException(status_code=400, detail={"error": {"code": "DUPLICATE", "message": "copy_code exists", "details": {}}})

    c = Copy(id_sach=payload.book_id, ma_ban_sao=payload.copy_code, id_vi_tri=payload.location_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id}


@router.patch("/{copy_id}")
def patch_copy(copy_id: int, payload: CopyPatch, db: Session = Depends(get_db)):
    c = db.get(Copy, copy_id)
    if not c:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Copy not found", "details": {}}})
    if payload.location_id is not None:
        if not db.get(Location, payload.location_id):
            raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_LOCATION", "message": "Location not found", "details": {}}})
        c.id_vi_tri = payload.location_id
    if payload.status is not None:
        c.trang_thai = payload.status
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"ok": True}


@router.get("/{copy_code}", response_model=CopyLookupOut)
def get_copy_by_code(copy_code: str, db: Session = Depends(get_db)):
    row = db.execute(select(Copy, Location).join(Location, Location.id == Copy.id_vi_tri).where(Copy.ma_ban_sao == copy_code)).first()
    if not row:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Copy not found", "details": {}}})
    c, l = row
    return CopyLookupOut(
        copy_code=c.ma_ban_sao,
        status=c.trang_thai,
        location={"code": l.ma_ke, "room": l.phong, "floor": l.tang},
    )


@router.get("")
def list_copies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    book_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Copy, Book, Location).join(Book, Copy.id_sach == Book.id).join(Location, Copy.id_vi_tri == Location.id)
    if book_id:
        query = query.filter(Copy.id_sach == book_id)
    if status:
        query = query.filter(Copy.trang_thai == status)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(Copy.ma_ban_sao).like(like)) |
            (func.lower(Book.tieu_de).like(like)) |
            (func.lower(Book.tac_gia).like(like)) |
            (func.lower(Location.ma_ke).like(like)) |
            (func.lower(Location.phong).like(like))
        )
    total = query.count()
    rows = query.order_by(Copy.id.desc()).offset((page - 1) * limit).limit(limit).all()
    items = []
    for c, b, l in rows:
        # Lấy ảnh đại diện của sách (nếu có)
        img = db.query(BookImage).filter(BookImage.id_sach == b.id, BookImage.la_anh_dai_dien == True).order_by(BookImage.thu_tu).first()
        primary_image_url = img.url_anh if img else None
        items.append(CopyListItem(
            id=c.id,
            copy_code=c.ma_ban_sao,
            status=c.trang_thai,
            book_id=b.id,
            book_title=b.tieu_de,
            book_authors=b.tac_gia,
            location_id=l.id,
            location_code=l.ma_ke,
            location_room=l.phong,
            location_floor=l.tang,
            primary_image_url=primary_image_url,
            created_at=c.tao_luc.isoformat() if c.tao_luc else None,
            updated_at=c.cap_nhat_luc.isoformat() if c.cap_nhat_luc else None,
        ))
    return CopyListResponse(items=items, page=page, limit=limit, total=total)


