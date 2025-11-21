from sqlalchemy import BigInteger, Column, String, Text

from ..db import Base


class Location(Base):
    __tablename__ = "vi_tri_ke"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ma_ke = Column(String(64), nullable=False, unique=True)
    tang = Column(String(32))
    phong = Column(String(64))
    ke = Column(String(32))
    hang = Column(String(32))
    cot = Column(String(32))
    ghi_chu = Column(Text)


