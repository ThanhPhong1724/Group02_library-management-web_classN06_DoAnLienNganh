from sqlalchemy import BigInteger, Boolean, Column, DateTime, Enum, String
from sqlalchemy.sql import func

from ..db import Base


class User(Base):
    __tablename__ = "nguoi_dung"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    mat_khau_hash = Column(String(255), nullable=False)
    ho_ten = Column(String(255), nullable=False)
    vai_tro = Column(Enum("admin", "user", name="vai_tro"), nullable=False)
    loai_nguoi_dung = Column(
        Enum("student", "staff", "guest", name="loai_nguoi_dung"),
        nullable=False,
        default="student",
    )
    hoat_dong = Column(Boolean, nullable=False, default=True)
    tao_luc = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    so_dien_thoai = Column(String(32), nullable=True)
    dia_chi = Column(String(255), nullable=True)

