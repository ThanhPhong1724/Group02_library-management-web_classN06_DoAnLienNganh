from datetime import datetime
from pydantic import BaseModel, Field


class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    body: str | None = None
    is_read: bool
    created_at: datetime


class NotificationReadPatch(BaseModel):
    is_read: bool = Field(..., alias="is_read")

    class Config:
        populate_by_name = True


class NotificationUpdate(BaseModel):
    type: str | None = None
    title: str | None = None
    body: str | None = None


