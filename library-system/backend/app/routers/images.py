from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.book import Book, BookImage
from ..schemas.images import BookImageCreate, BookImageOut, BookImageUpdate


router = APIRouter(prefix="/books/{book_id}/images", tags=["book-images"])


def ensure_book(db: Session, book_id: int) -> Book:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Book not found", "details": {}}})
    return book


@router.post("", response_model=BookImageOut, status_code=status.HTTP_201_CREATED)
def create_image(book_id: int, payload: BookImageCreate, db: Session = Depends(get_db)):
    ensure_book(db, book_id)
    img = BookImage(
        id_sach=book_id,
        url_anh=payload.image_url,
        la_anh_dai_dien=bool(payload.is_primary),
        thu_tu=payload.sort_order or 0,
    )
    db.add(img)
    db.commit()
    db.refresh(img)
    return BookImageOut(id=img.id, image_url=img.url_anh, is_primary=bool(img.la_anh_dai_dien), sort_order=img.thu_tu)


@router.patch("/{image_id}", response_model=BookImageOut)
def patch_image(book_id: int, image_id: int, payload: BookImageUpdate, db: Session = Depends(get_db)):
    ensure_book(db, book_id)
    img = db.execute(select(BookImage).where(BookImage.id == image_id, BookImage.id_sach == book_id)).scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Image not found", "details": {}}})

    if payload.image_url is not None:
        img.url_anh = payload.image_url
    if payload.is_primary is not None:
        img.la_anh_dai_dien = bool(payload.is_primary)
    if payload.sort_order is not None:
        img.thu_tu = payload.sort_order

    db.add(img)
    db.commit()
    db.refresh(img)
    return BookImageOut(id=img.id, image_url=img.url_anh, is_primary=bool(img.la_anh_dai_dien), sort_order=img.thu_tu)


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(book_id: int, image_id: int, db: Session = Depends(get_db)):
    ensure_book(db, book_id)
    img = db.execute(select(BookImage).where(BookImage.id == image_id, BookImage.id_sach == book_id)).scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Image not found", "details": {}}})
    db.delete(img)
    db.commit()
    return None


