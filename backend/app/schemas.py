# app/schemas.py
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict # Import ConfigDict for Pydantic v2+

# Assuming CurrencyEnum is defined in app/models.py or directly here
import enum

class CurrencyEnum(str, enum.Enum): # Inherit from str for JSON serialization
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    # Add other currencies as needed

# --- Location Schemas ---
class LocationBase(BaseModel):
    address: str
    longitude: float
    latitude: float

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    model_config = ConfigDict(from_attributes=True) # For Pydantic v2+
    # class Config: # For Pydantic v1
    #     orm_mode = True

# --- Service Schemas ---
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: CurrencyEnum
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    created_at: datetime # Include auto-generated field for response

    model_config = ConfigDict(from_attributes=True) # For Pydantic v2+
    # class Config: # For Pydantic v1
    #     orm_mode = True

# --- Availability Schemas ---
class AvailabilityBase(BaseModel):
    date: date
    time: datetime # Will store time part
    is_taken: bool = False

class AvailabilityCreate(AvailabilityBase):
    pass

class Availability(AvailabilityBase):
    id: int

    model_config = ConfigDict(from_attributes=True) # For Pydantic v2+
    # class Config: # For Pydantic v1
    #     orm_mode = True

# --- Order Schemas ---
class OrderBase(BaseModel):
    plate_number: str
    phone_number: str
    location_id: int
    availability_id: int
    service_ids: List[int] = [] # For creating an order, provide service IDs

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    created_at: datetime

    # Nested Pydantic models for relationships
    # These will be populated by SQLAlchemy's ORM when fetched
    location: Location # Reference the Location schema
    availability: Availability # Reference the Availability schema
    services: List[Service] # Reference the Service schema (list for many-to-many)

    model_config = ConfigDict(from_attributes=True) # For Pydantic v2+
    # class Config: # For Pydantic v1
    #     orm_mode = True