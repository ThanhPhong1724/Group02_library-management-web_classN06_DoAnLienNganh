from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text, Boolean, Date, Enum, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import Session

from ..db import Base


class Notification(Base):
    __tablename__ = "thong_bao"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    id_nguoi_dung = Column(BigInteger, ForeignKey("nguoi_dung.id"), nullable=False)
    loai = Column(String(40), nullable=False)
    tieu_de = Column(Text, nullable=False)
    noi_dung = Column(Text)
    da_doc = Column(Boolean, nullable=False, default=False)
    tao_luc = Column(DateTime, nullable=False, server_default=func.current_timestamp())


class Setting(Base):
    __tablename__ = "cau_hinh_thu_vien"

    khoa = Column(String(100), primary_key=True)
    gia_tri = Column(Text, nullable=False)


class Rule(Base):
    __tablename__ = "noi_quy_dong"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    tieu_de = Column(String(255), nullable=False)
    mo_ta = Column(Text)
    danh_muc = Column(Enum('borrowing','behavior','penalty','general','technical', name='rule_category'), default='general')
    trang_thai = Column(Enum('active','inactive','draft', name='rule_status'), default='active')
    muc_do = Column(Enum('low','medium','high','critical', name='rule_priority'), default='medium')
    doi_tuong = Column(Enum('all','students','teachers','staff','specific', name='rule_applies_to'), default='all')
    ngay_hieu_luc = Column(Date)
    ngay_het_hieu_luc = Column(Date)
    so_tien_phat = Column(Numeric(12,2))
    loai_phat = Column(Enum('fine','suspension','warning','none', name='rule_penalty_type'), default='none')
    don_vi_tien = Column(String(10), default='VND')
    nguoi_tao = Column(String(255))
    nguoi_cap_nhat = Column(String(255))
    tao_luc = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    cap_nhat_luc = Column(DateTime, nullable=False, server_default=func.current_timestamp(), onupdate=func.current_timestamp())


def create_notification(db: Session, user_id: int, type: str, title: str, body: str | None = None):
    n = Notification(
        id_nguoi_dung=user_id,
        loai=type,
        tieu_de=title,
        noi_dung=body,
        da_doc=False,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


