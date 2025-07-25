# app/models.py
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Date, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .database import Base # Ensure this import is correct

# Enums can be useful for predefined choices, like currency
import enum

class CurrencyEnum(enum.Enum):
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    # Add other currencies as needed

class OrderStatusEnum(str, enum.Enum): # Inherit from str for PostgreSQL compatibility and Pydantic
    OPEN = "open"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    # Add other statuses as needed

class ServiceCategoryEnum(str, enum.Enum): # Inherit from str for PostgreSQL compatibility and Pydantic
    BASIC= "Basic"
    EXTRA = "Extra"

class ProcessStepStatusEnum(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    address: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationship to Orders
    orders: Mapped[List["Order"]] = relationship(back_populates="location")

    def __repr__(self):
        return f"<Location(id={self.id}, address='{self.address}')>"

class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[ServiceCategoryEnum] = mapped_column(Enum(ServiceCategoryEnum), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Optional
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[CurrencyEnum] = mapped_column(Enum(CurrencyEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Many-to-Many relationship with Order via order_service_association
    # Note: 'secondary' is the association table
    # This relationship doesn't need to be defined on the Service side for Order.services to work
    # but it's good practice for full ORM mapping if you ever query Service.orders directly.
    orders: Mapped[List["Order"]] = relationship(
        secondary="order_service_association",
        back_populates="services"
    )

    def __repr__(self):
        return f"<Service(id={self.id}, category='{self.category}', name='{self.name}', price={self.price})>"

class Availability(Base):
    __tablename__ = "availabilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False) # Store time part (e.g., 'HH:MM:SS')
    is_taken: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationship to Order
    orders: Mapped[List["Order"]] = relationship(back_populates="availability")

    # Optional: Add a unique constraint if (date, time) should be unique for availabilities
    # __table_args__ = (UniqueConstraint("date", "time", name="uq_availability_date_time"),)

    def __repr__(self):
        return f"<Availability(id={self.id}, time={self.time.strftime('%H:%M')}, taken={self.is_taken})>"

# Association table for the many-to-many relationship between Order and Service
# This is a simple table just for the foreign keys
class OrderServiceAssociation(Base):
    __tablename__ = "order_service_association"
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), primary_key=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), primary_key=True)

class ProcessStep(Base):
    __tablename__ = "process_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[ProcessStepStatusEnum] = mapped_column(
        Enum(ProcessStepStatusEnum),
        default=ProcessStepStatusEnum.PENDING,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=datetime.utcnow)

    # Foreign Key to Order (many-to-one: many steps belong to one order)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    order: Mapped["Order"] = relationship(back_populates="process_steps")

    def __repr__(self):
        return f"<ProcessStep(id={self.id}, name='{self.name}', status='{self.status}', order_id={self.order_id})>"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    phone_identifier: Mapped[str] = mapped_column(String, index=True, nullable=False)
    plate_number: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    status: Mapped[OrderStatusEnum] = mapped_column(
        Enum(OrderStatusEnum), # Use the Enum type
        default=OrderStatusEnum.OPEN, # Set the default value for new rows
        nullable=False # This will be enforced after the migration
    )

    # Foreign Key to Location (one-to-many: one location can have many orders)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    location: Mapped["Location"] = relationship(back_populates="orders")

    # Foreign Key to Availability (one-to-one or one-to-many based on logic:
    # An availability slot can be taken by one order, or one order uses one availability slot)
    # If one availability slot can only be taken by ONE order, consider unique=True on the FK
    availability_id: Mapped[int] = mapped_column(ForeignKey("availabilities.id"), unique=True, nullable=False)
    availability: Mapped["Availability"] = relationship(back_populates="orders")

    # One-to-Many relationship to ProcessStep
    process_steps: Mapped[List["ProcessStep"]] = relationship(
        back_populates="order",
        order_by="ProcessStep.created_at" # Optional: Order steps by creation time
    )

    # Many-to-Many relationship with Service
    # 'secondary' points to the association table
    # 'back_populates' links back to the relationship on the Service model
    services: Mapped[List["Service"]] = relationship(
        secondary="order_service_association",
        back_populates="orders"
    )

    def __repr__(self):
        return (f"<Order(id={self.id}, plate_number='{self.plate_number}', "
                f"location_id={self.location_id}, availability_id={self.availability_id})>")