from pydantic import BaseModel, Field


class SettingsOut(BaseModel):
    opening_hours: str | None = None
    rules: str | None = None
    bank_info: str | None = None
    library_name: str | None = None
    library_address: str | None = None
    library_phone: str | None = None
    library_email: str | None = None
    library_website: str | None = None
    max_loan_days: int | None = None
    max_books_per_user: int | None = None
    fine_per_day: int | None = None
    auto_renewal: bool | None = None
    email_notifications: bool | None = None
    sms_notifications: bool | None = None
    maintenance_mode: bool | None = None
    backup_frequency: str | None = None
    language: str | None = None
    timezone: str | None = None
    date_format: str | None = None


class SettingsUpdate(BaseModel):
    opening_hours: str | None = Field(None, alias="opening_hours")
    rules: str | None = Field(None, alias="rules")
    bank_info: str | None = Field(None, alias="bank_info")
    library_name: str | None = Field(None, alias="library_name")
    library_address: str | None = Field(None, alias="library_address")
    library_phone: str | None = Field(None, alias="library_phone")
    library_email: str | None = Field(None, alias="library_email")
    library_website: str | None = Field(None, alias="library_website")
    max_loan_days: int | None = Field(None, alias="max_loan_days")
    max_books_per_user: int | None = Field(None, alias="max_books_per_user")
    fine_per_day: int | None = Field(None, alias="fine_per_day")
    auto_renewal: bool | None = Field(None, alias="auto_renewal")
    email_notifications: bool | None = Field(None, alias="email_notifications")
    sms_notifications: bool | None = Field(None, alias="sms_notifications")
    maintenance_mode: bool | None = Field(None, alias="maintenance_mode")
    backup_frequency: str | None = Field(None, alias="backup_frequency")
    language: str | None = Field(None, alias="language")
    timezone: str | None = Field(None, alias="timezone")
    date_format: str | None = Field(None, alias="date_format")

    class Config:
        populate_by_name = True


