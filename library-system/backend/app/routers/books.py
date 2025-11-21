from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.book import Book, BookImage, Publisher
from ..models.copy import Copy
from ..models.location import Location
from ..schemas.books import (
    BookCreate,
    BookDetail,
    BookDetailResponse,
    BookListItem,
    BookListResponse,
    BookUpdate,
)


router = APIRouter(prefix="/books", tags=["books"])


@router.get("")
def list_books(
    search: Optional[str] = Query(None),
    subjects: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    publisher: Optional[str] = Query(None),
    pub_year: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
) -> BookListResponse:
    base = select(Book, Publisher.ten.label("publisher"))
    base = base.join(Publisher, Publisher.id == Book.id_nxb, isouter=True)

    if search:
        like = f"%{search}%"
        base = base.where(
            func.lower(Book.tieu_de).like(func.lower(like)) |
            func.lower(Book.tac_gia).like(func.lower(like))
        )
    if subjects and subjects != "all":
        base = base.where(Book.the_loai == subjects)
    if language and language != "all":
        base = base.where(Book.ngon_ngu == language)
    if publisher and publisher != "all":
        base = base.where(Publisher.ten == publisher)
    if pub_year:
        base = base.where(Book.nam_xb == pub_year)

    total = db.execute(select(func.count()).select_from(base.subquery())).scalar_one()
    stmt = base.order_by(Book.id).offset((page - 1) * limit).limit(limit)
    rows = db.execute(stmt).all()

    items: list[BookListItem] = []
    for r, pub in rows:
        primary_image = db.execute(
            select(BookImage.url_anh).where(BookImage.id_sach == r.id, BookImage.la_anh_dai_dien == True).limit(1)
        ).scalar_one_or_none()
        items.append(
            BookListItem(
                id=r.id,
                title=r.tieu_de,
                authors=r.tac_gia,
                publisher=pub,
                pub_year=r.nam_xb,
                cover_price=float(r.gia_bia) if r.gia_bia is not None else None,
                currency=r.don_vi_tien,
                quantity_total=r.so_luong_tong,
                quantity_avail=r.so_luong_con,
                primary_image_url=primary_image,
                subjects=r.the_loai,
                language=r.ngon_ngu,
            )
        )
    return BookListResponse(items=items, page=page, limit=limit, total=total)


@router.get("/subjects", response_model=List[str])
def get_subjects(db: Session = Depends(get_db)):
    rows = db.execute(select(func.distinct(Book.the_loai)).where(Book.the_loai != None)).scalars().all()
    return [r for r in rows if r]

@router.get("/languages", response_model=List[str])
def get_languages(db: Session = Depends(get_db)):
    rows = db.execute(select(func.distinct(Book.ngon_ngu)).where(Book.ngon_ngu != None)).scalars().all()
    return [r for r in rows if r]

@router.get("/publishers", response_model=List[str])
def get_publishers(db: Session = Depends(get_db)):
    rows = db.execute(select(func.distinct(Publisher.ten)).where(Publisher.ten != None)).scalars().all()
    return [r for r in rows if r]

@router.get("/{book_id}")
def get_book_detail(book_id: int, db: Session = Depends(get_db)) -> BookDetailResponse:
    row = db.execute(
        select(Book, Publisher.ten.label("publisher")).join(Publisher, Publisher.id == Book.id_nxb, isouter=True).where(Book.id == book_id)
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Book not found", "details": {}}})
    b, pub = row

    images_rows = db.execute(
        select(BookImage).where(BookImage.id_sach == book_id).order_by(BookImage.la_anh_dai_dien.desc(), BookImage.thu_tu.asc())
    ).scalars().all()
    images = [
        {"id": i.id, "image_url": i.url_anh, "is_primary": bool(i.la_anh_dai_dien), "sort_order": i.thu_tu}
        for i in images_rows
    ]

    copies_rows = db.execute(
        select(Copy, Location).join(Location, Location.id == Copy.id_vi_tri).where(Copy.id_sach == book_id)
    ).all()
    copies = [
        {
            "id": c.id,
            "copy_code": c.ma_ban_sao,
            "status": c.trang_thai,
            "location": {
                "id": l.id,
                "code": l.ma_ke,
                "room": l.phong,
                "floor": l.tang,
            },
        }
        for c, l in copies_rows
    ]

    book = BookDetail(
        id=b.id,
        title=b.tieu_de,
        subtitle=b.tieu_de_phu,
        authors=b.tac_gia,
        publisher=pub,
        pub_year=b.nam_xb,
        language=b.ngon_ngu,
        subjects=b.the_loai,
        description=b.mo_ta,
        cover_price=float(b.gia_bia) if b.gia_bia is not None else None,
        currency=b.don_vi_tien,
        quantity_total=b.so_luong_tong,
        quantity_avail=b.so_luong_con,
    )

    return BookDetailResponse(book=book, images=images, copies=copies)


@router.post("")
def create_book(payload: BookCreate, db: Session = Depends(get_db)):
    b = Book(
        tieu_de=payload.title,
        tieu_de_phu=payload.subtitle,
        tac_gia=payload.authors,
        id_nxb=payload.publisher_id,
        nam_xb=payload.pub_year,
        ngon_ngu=payload.language,
        the_loai=payload.subjects,
        mo_ta=payload.description,
        gia_bia=payload.cover_price,
        don_vi_tien=payload.currency,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return {"id": b.id}


@router.put("/{book_id}")
def update_book(book_id: int, payload: BookUpdate, db: Session = Depends(get_db)):
    b = db.get(Book, book_id)
    if not b:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Book not found", "details": {}}})

    for field, value in payload.model_dump(by_alias=True, exclude_unset=True).items():
        if field == "title":
            b.tieu_de = value
        elif field == "subtitle":
            b.tieu_de_phu = value
        elif field == "authors":
            b.tac_gia = value
        elif field == "publisher_id":
            b.id_nxb = value
        elif field == "pub_year":
            b.nam_xb = value
        elif field == "language":
            b.ngon_ngu = value
        elif field == "subjects":
            b.the_loai = value
        elif field == "description":
            b.mo_ta = value
        elif field == "cover_price":
            b.gia_bia = value
        elif field == "currency":
            b.don_vi_tien = value

    db.add(b)
    db.commit()
    return {"id": b.id}


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    b = db.get(Book, book_id)
    if not b:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Book not found", "details": {}}})
    db.delete(b)
    db.commit()
    return {"ok": True}



