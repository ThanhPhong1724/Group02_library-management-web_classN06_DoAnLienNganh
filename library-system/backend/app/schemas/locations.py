from pydantic import BaseModel, Field
from typing import Optional

class LocationCreate(BaseModel):
    code: str = Field(..., alias="code")
    floor: str | None = Field(None, alias="floor")
    room: str | None = Field(None, alias="room")
    shelf: str | None = Field(None, alias="shelf")
    row: str | None = Field(None, alias="row")
    col: str | None = Field(None, alias="col")
    note: str | None = Field(None, alias="note")

    class Config:
        populate_by_name = True


class LocationOut(BaseModel):
    id: int
    code: str
    floor: str | None = None
    room: str | None = None
    shelf: str | None = None
    row: str | None = None
    col: str | None = None
    note: str | None = None

class LocationUpdate(BaseModel):
    code: str
    floor: str
    room: str
    shelf: str
    row: str
    col: str
    note: Optional[str] = None
