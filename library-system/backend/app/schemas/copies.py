from pydantic import BaseModel, Field
from typing import List, Optional


class CopyCreate(BaseModel):
    book_id: int = Field(..., alias="book_id")
    copy_code: str = Field(..., alias="copy_code")
    location_id: int = Field(..., alias="location_id")

    class Config:
        populate_by_name = True


class CopyPatch(BaseModel):
    location_id: int | None = Field(None, alias="location_id")
    status: str | None = Field(None, alias="status")

    class Config:
        populate_by_name = True


class CopyLookupOut(BaseModel):
    copy_code: str
    status: str
    location: dict


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
    created_at: Optional[str]
    updated_at: Optional[str]

class CopyListResponse(BaseModel):
    items: List[CopyListItem]
    page: int
    limit: int
    total: int


