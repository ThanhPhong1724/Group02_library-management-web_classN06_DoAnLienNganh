from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.book import Publisher
from ..schemas.publishers import PublisherCreate, PublisherOut, PublisherUpdate


router = APIRouter(prefix="/publishers", tags=["publishers"])


@router.get("", response_model=List[PublisherOut])
def list_publishers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    stmt = select(Publisher).order_by(Publisher.id).offset((page - 1) * limit).limit(limit)
    items = db.execute(stmt).scalars().all()
    return [PublisherOut(id=i.id, name=i.ten, address=i.dia_chi, website=i.website, note=i.ghi_chu) for i in items]


@router.post("", response_model=PublisherOut, status_code=status.HTTP_201_CREATED)
def create_publisher(payload: PublisherCreate, db: Session = Depends(get_db)):
    # name unique per schema
    exists = db.execute(select(Publisher).where(Publisher.ten == payload.name)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail={"error": {"code": "DUPLICATE", "message": "Publisher already exists", "details": {}}})

    pub = Publisher(ten=payload.name, dia_chi=payload.address, website=payload.website, ghi_chu=payload.note)
    db.add(pub)
    db.commit()
    db.refresh(pub)
    return PublisherOut(id=pub.id, name=pub.ten, address=pub.dia_chi, website=pub.website, note=pub.ghi_chu)


@router.put("/{publisher_id}", response_model=PublisherOut)
def update_publisher(publisher_id: int, payload: PublisherUpdate, db: Session = Depends(get_db)):
    pub = db.get(Publisher, publisher_id)
    if not pub:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Publisher not found", "details": {}}})

    if payload.name is not None:
        # uniqueness
        dup = db.execute(
            select(Publisher).where(Publisher.ten == payload.name, Publisher.id != publisher_id)
        ).scalar_one_or_none()
        if dup:
            raise HTTPException(status_code=400, detail={"error": {"code": "DUPLICATE", "message": "Publisher name exists", "details": {}}})
        pub.ten = payload.name
    if payload.address is not None:
        pub.dia_chi = payload.address
    if payload.website is not None:
        pub.website = payload.website
    if payload.note is not None:
        pub.ghi_chu = payload.note

    db.add(pub)
    db.commit()
    db.refresh(pub)
    return PublisherOut(id=pub.id, name=pub.ten, address=pub.dia_chi, website=pub.website, note=pub.ghi_chu)


@router.delete("/{publisher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publisher(publisher_id: int, db: Session = Depends(get_db)):
    pub = db.get(Publisher, publisher_id)
    if not pub:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Publisher not found", "details": {}}})
    db.delete(pub)
    db.commit()
    return None


