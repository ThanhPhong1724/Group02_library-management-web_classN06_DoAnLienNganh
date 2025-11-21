from sqlalchemy import BigInteger, Column, DECIMAL, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship

from ..db import Base


class Publisher(Base):
    __tablename__ = "nha_xuat_ban"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ten = Column(String(255), nullable=False, unique=True)
    dia_chi = Column(String(255))
    website = Column(String(255))
    ghi_chu = Column(Text)

    books = relationship("Book", back_populates="publisher")


class Book(Base):
    __tablename__ = "sach"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    tieu_de = Column(Text, nullable=False)
    tieu_de_phu = Column(Text)
    tac_gia = Column(Text, nullable=False)
    id_nxb = Column(BigInteger, ForeignKey("nha_xuat_ban.id"))
    nam_xb = Column(Integer)
    ngon_ngu = Column(String(32))
    the_loai = Column(Text)
    mo_ta = Column(Text)
    gia_bia = Column(DECIMAL(12, 2))
    don_vi_tien = Column(String(10), default="VND")
    so_luong_tong = Column(Integer, nullable=False, default=0)
    so_luong_con = Column(Integer, nullable=False, default=0)

    publisher = relationship("Publisher", back_populates="books")


class BookImage(Base):
    __tablename__ = "anh_sach"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    id_sach = Column(BigInteger, ForeignKey("sach.id"), nullable=False)
    url_anh = Column(Text, nullable=False)
    la_anh_dai_dien = Column(Boolean, nullable=False, default=False)
    thu_tu = Column(Integer, nullable=False, default=0)


