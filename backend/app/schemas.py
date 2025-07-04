from pydantic import BaseModel

class ItemBase(BaseModel):
    name: str
    description: str | None = None
    price: int

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True # Essential for SQLAlchemy models to work with Pydantic
        # For Pydantic v2+, this is model_config = ConfigDict(from_attributes=True)