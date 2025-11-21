from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.sql import func

from ..db import Base


class Copy(Base):
    __tablename__ = "ban_sao"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    id_sach = Column(BigInteger, ForeignKey("sach.id"), nullable=False)
    ma_ban_sao = Column(String(64), nullable=False, unique=True)
    id_vi_tri = Column(BigInteger, ForeignKey("vi_tri_ke.id"), nullable=False)
    trang_thai = Column(
        Enum(
            "available",
            "on_loan",
            "reserved",
            "lost",
            "maintenance",
            name="trang_thai_copy",
        ),
        nullable=False,
        default="available",
    )
    tao_luc = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    cap_nhat_luc = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )


