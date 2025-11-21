from typing import List, Optional

from pydantic import BaseModel, Field


class BookCreate(BaseModel):
    title: str = Field(..., alias="title")
    subtitle: Optional[str] = Field(None, alias="subtitle")
    authors: str = Field(..., alias="authors")
    publisher_id: Optional[int] = Field(None, alias="publisher_id")
    pub_year: Optional[int] = Field(None, alias="pub_year")
    language: Optional[str] = Field(None, alias="language")
    subjects: Optional[str] = Field(None, alias="subjects")
    description: Optional[str] = Field(None, alias="description")
    cover_price: Optional[float] = Field(None, alias="cover_price")
    currency: Optional[str] = Field("VND", alias="currency")

    class Config:
        populate_by_name = True


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, alias="title")
    subtitle: Optional[str] = Field(None, alias="subtitle")
    authors: Optional[str] = Field(None, alias="authors")
    publisher_id: Optional[int] = Field(None, alias="publisher_id")
    pub_year: Optional[int] = Field(None, alias="pub_year")
    language: Optional[str] = Field(None, alias="language")
    subjects: Optional[str] = Field(None, alias="subjects")
    description: Optional[str] = Field(None, alias="description")
    cover_price: Optional[float] = Field(None, alias="cover_price")
    currency: Optional[str] = Field(None, alias="currency")

    class Config:
        populate_by_name = True


class BookListItem(BaseModel):
    id: int
    title: str
    authors: str
    publisher: Optional[str] = None
    pub_year: Optional[int] = None
    cover_price: Optional[float] = None
    currency: Optional[str] = None
    quantity_total: int
    quantity_avail: int
    primary_image_url: Optional[str] = None
    subjects: Optional[str] = None
    language: Optional[str] = None


class BookListResponse(BaseModel):
    items: List[BookListItem]
    page: int
    limit: int
    total: int


class BookImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    sort_order: int


class LocationOut(BaseModel):
    id: int
    code: str
    room: Optional[str] = None
    floor: Optional[str] = None


class CopyOut(BaseModel):
    id: int
    copy_code: str
    status: str
    location: LocationOut


class BookDetail(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    authors: str
    publisher: Optional[str]
    pub_year: Optional[int]
    language: Optional[str]
    subjects: Optional[str]
    description: Optional[str]
    cover_price: Optional[float]
    currency: Optional[str]
    quantity_total: int
    quantity_avail: int


class BookDetailResponse(BaseModel):
    book: BookDetail
    images: List[BookImageOut]
    copies: List[CopyOut]



