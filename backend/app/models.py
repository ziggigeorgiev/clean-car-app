from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    price = Column(Integer)
    

# If using SQLModel, it simplifies this:
# from sqlmodel import Field, SQLModel
# class Item(SQLModel, table=True):
#     id: int | None = Field(default=None, primary_key=True)
#     name: str
#     description: str | None = None
#     price: int
#     is_offer: bool = False