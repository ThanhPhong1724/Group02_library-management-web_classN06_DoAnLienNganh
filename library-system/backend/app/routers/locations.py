from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.location import Location
from ..schemas.locations import LocationCreate, LocationOut, LocationUpdate


router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("", response_model=List[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    rows = db.execute(select(Location).order_by(Location.id.asc())).scalars().all()
    return [
        LocationOut(
            id=r.id,
            code=r.ma_ke,
            floor=r.tang,
            room=r.phong,
            shelf=r.ke,
            row=r.hang,
            col=r.cot,
            note=r.ghi_chu,
        )
        for r in rows
    ]


@router.post("", response_model=LocationOut)
def create_location(payload: LocationCreate, db: Session = Depends(get_db)):
    dup = db.execute(select(Location).where(Location.ma_ke == payload.code)).scalar_one_or_none()
    if dup:
        raise HTTPException(status_code=400, detail={"error": {"code": "DUPLICATE", "message": "Location code exists", "details": {}}})
    loc = Location(
        ma_ke=payload.code,
        tang=payload.floor,
        phong=payload.room,
        ke=payload.shelf,
        hang=payload.row,
        cot=payload.col,
        ghi_chu=payload.note,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return LocationOut(
        id=loc.id,
        code=loc.ma_ke,
        floor=loc.tang,
        room=loc.phong,
        shelf=loc.ke,
        row=loc.hang,
        col=loc.cot,
        note=loc.ghi_chu,
    )

@router.put("/{id}", response_model=LocationOut)
def update_location(id: int, payload: LocationUpdate, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    # Cập nhật các trường
    loc.ma_ke = payload.code
    loc.tang = payload.floor
    loc.phong = payload.room
    loc.ke = payload.shelf
    loc.hang = payload.row
    loc.cot = payload.col
    loc.ghi_chu = payload.note
    db.commit()
    db.refresh(loc)
    return LocationOut(
        id=loc.id,
        code=loc.ma_ke,
        floor=loc.tang,
        room=loc.phong,
        shelf=loc.ke,
        row=loc.hang,
        col=loc.cot,
        note=loc.ghi_chu,
    )

@router.delete("/{id}", status_code=204)
def delete_location(id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    return None  # hoặc: return Response(status_code=204)