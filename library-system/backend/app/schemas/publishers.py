from pydantic import BaseModel, Field


class PublisherBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, alias="name")
    address: str | None = Field(None, alias="address")
    website: str | None = Field(None, alias="website")
    note: str | None = Field(None, alias="note")

    class Config:
        populate_by_name = True
        from_attributes = True


class PublisherCreate(PublisherBase):
    pass


class PublisherUpdate(BaseModel):
    name: str | None = Field(None, alias="name")
    address: str | None = Field(None, alias="address")
    website: str | None = Field(None, alias="website")
    note: str | None = Field(None, alias="note")

    class Config:
        populate_by_name = True
        from_attributes = True


class PublisherOut(BaseModel):
    id: int
    name: str
    address: str | None = None
    website: str | None = None
    note: str | None = None

    class Config:
        from_attributes = True


