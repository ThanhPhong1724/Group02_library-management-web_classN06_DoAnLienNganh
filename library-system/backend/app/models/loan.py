from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.sql import func

from ..db import Base


class Loan(Base):
    __tablename__ = "phieu_muon"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    id_ban_sao = Column(BigInteger, ForeignKey("ban_sao.id"), nullable=False)
    id_nguoi_dung = Column(BigInteger, ForeignKey("nguoi_dung.id"), nullable=False)
    trang_thai = Column(
        Enum(
            "requested",
            "rejected",
            "borrowed",
            "return_requested",
            "returned",
            "overdue",
            name="loan_status",
        ),
        nullable=False,
    )
    ly_do_tu_choi = Column(Text)
    nguoi_duyet = Column(BigInteger)
    duyet_luc = Column(DateTime)
    muon_luc = Column(DateTime)
    han_tra = Column(DateTime)
    yeu_cau_tra_luc = Column(DateTime)
    nguoi_duyet_tra = Column(BigInteger)
    tra_luc = Column(DateTime)
    # Thêm các trường phạt tiền
    so_tien_phat = Column(Numeric(12, 2), default=0)
    noi_dung_phat = Column(Text, nullable=True)
    da_nop_phat = Column(Boolean, default=False)
    ngay_nop_phat = Column(DateTime, nullable=True)
    admin_xac_nhan_phat = Column(BigInteger, nullable=True)
    tao_luc = Column(DateTime, nullable=False, server_default=func.current_timestamp())


