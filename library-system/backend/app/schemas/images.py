from pydantic import BaseModel, Field


class BookImageCreate(BaseModel):
    image_url: str = Field(..., alias="image_url")
    is_primary: bool = Field(False, alias="is_primary")
    sort_order: int = Field(0, alias="sort_order")

    class Config:
        populate_by_name = True


class BookImageUpdate(BaseModel):
    image_url: str | None = Field(None, alias="image_url")
    is_primary: bool | None = Field(None, alias="is_primary")
    sort_order: int | None = Field(None, alias="sort_order")

    class Config:
        populate_by_name = True


class BookImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    sort_order: int


