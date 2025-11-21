from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class RuleBase(BaseModel):
    tieu_de: str = Field(..., min_length=1, max_length=255)
    mo_ta: Optional[str] = None
    danh_muc: Optional[str] = 'general'
    trang_thai: Optional[str] = 'active'
    muc_do: Optional[str] = 'medium'
    doi_tuong: Optional[str] = 'all'
    ngay_hieu_luc: Optional[date] = None
    ngay_het_hieu_luc: Optional[date] = None
    so_tien_phat: Optional[float] = None
    loai_phat: Optional[str] = 'none'
    don_vi_tien: Optional[str] = 'VND'

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    tieu_de: Optional[str] = None
    mo_ta: Optional[str] = None
    danh_muc: Optional[str] = None
    trang_thai: Optional[str] = None
    muc_do: Optional[str] = None
    doi_tuong: Optional[str] = None
    ngay_hieu_luc: Optional[date] = None
    ngay_het_hieu_luc: Optional[date] = None
    so_tien_phat: Optional[float] = None
    loai_phat: Optional[str] = None
    don_vi_tien: Optional[str] = None

class RuleOut(RuleBase):
    id: int
    nguoi_tao: Optional[str] = None
    nguoi_cap_nhat: Optional[str] = None
    tao_luc: Optional[datetime] = None
    cap_nhat_luc: Optional[datetime] = None

    class Config:
        orm_mode = True
