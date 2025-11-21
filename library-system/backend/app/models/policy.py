from sqlalchemy import BigInteger, Column, Enum, Integer, Numeric

from ..db import Base


class Policy(Base):
    __tablename__ = "chinh_sach"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    loai_nguoi_dung = Column(
        Enum("student", "staff", "guest", name="policy_user_type"),
        nullable=False,
        unique=True,
    )
    toi_da_muon = Column(Integer, nullable=False, default=3)
    so_ngay_muon = Column(Integer, nullable=False, default=14)
    phat_moi_ngay = Column(Numeric(10, 2), nullable=False, default=0)
    so_lan_gia_han = Column(Integer, nullable=False, default=0)


