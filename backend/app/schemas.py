# app/schemas.py
from datetime import date, datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict # Import ConfigDict for Pydantic v2+

# Assuming CurrencyEnum is defined in app/models.py or directly here
import enum

class CurrencyEnum(str, enum.Enum): # Inherit from str for JSON serialization
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    # Add other currencies as needed

class BrandEnum(str, enum.Enum): # White-label tenant (must match models.BrandEnum)
    CAR = "car"
    HOME = "home"

class OrderStatusEnum(str, enum.Enum): # Inherit from str for PostgreSQL compatibility and Pydantic
    OPEN = "open"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    # Add other statuses as needed

class ServiceCategoryEnum(str, enum.Enum): # Inherit from str for PostgreSQL compatibility and Pydantic
    BASIC= "Basic"
    EXTRA = "Extra"

class ProcessStepStatusEnum(str, enum.Enum): # Must match the enum in models.py
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

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
    brand: BrandEnum = BrandEnum.CAR # Which white-label app this service belongs to
    category: ServiceCategoryEnum = ServiceCategoryEnum.BASIC # Default category
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

# A booked service together with its quantity. Returned on orders so the home
# (couch/mattress) app can show "Sofa cleaning × 2". For the car app quantity
# is always 1.
class ServiceItem(BaseModel):
    service: Service
    quantity: int = 1

    model_config = ConfigDict(from_attributes=True)

# --- Availability Schemas ---
class AvailabilityBase(BaseModel):
    time: datetime # Will store time part
    is_taken: bool = False

class AvailabilityCreate(AvailabilityBase):
    pass

class Availability(AvailabilityBase):
    id: int

    model_config = ConfigDict(from_attributes=True) # For Pydantic v2+
    # class Config: # For Pydantic v1
    #     orm_mode = True

# --- ProcessStep Schemas ---
class ProcessStepBase(BaseModel):
    name: str
    text: Optional[str] = None # Optional text field for additional info
    status: ProcessStepStatusEnum = ProcessStepStatusEnum.PENDING

class ProcessStepCreate(ProcessStepBase):
    # order_id is removed here as it will be set by the backend during Order creation
    pass

class ProcessStep(ProcessStepBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None # Optional field for updates
    order_id: int # Still present in the full schema for response

    model_config = ConfigDict(from_attributes=True)

# --- Order Schemas ---
class OrderBase(BaseModel):
    brand: BrandEnum = BrandEnum.CAR # Which white-label app placed the order
    phone_identifier: str
    status: OrderStatusEnum = OrderStatusEnum.OPEN # Default status
    name: Optional[str] = None # Customer name collected at booking
    plate_number: Optional[str] = None # No plate for the home (couch/mattress) app
    phone_number: str
    location: LocationCreate
    availability_id: int
    service_ids: List[int] = [] # For creating an order, provide service IDs
    # Optional per-service quantities, keyed by service id. When omitted (or a
    # given id is missing), the quantity defaults to 1 — so the car app can keep
    # sending just `service_ids`.
    service_quantities: Optional[Dict[int, int]] = None
    email: Optional[str] = None # Optional contact email for confirmation
    locale: Optional[str] = None # Customer's app language (e.g. "de", "en") — used to localize emails

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    created_at: datetime

    # Nested Pydantic models for relationships
    # These will be populated by SQLAlchemy's ORM when fetched
    location: Location # Reference the Location schema
    availability: Availability # Reference the Availability schema
    services: List[Service]# Reference the Service schema (list for many-to-many)
    # Quantity-aware view of the booked services (each item = service + quantity).
    service_items: List[ServiceItem] = []
    process_steps: List[ProcessStep]

    model_config = ConfigDict(from_attributes=True) # For Pydantic v2+
    # class Config: # For Pydantic v1
    #     orm_mode = True