# app/crud.py
import datetime
from typing import List, Optional

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select

from . import models, schemas


# --- New CRUD functions for your new models ---

def get_orders(db: Session, phone_identifier: str, skip: int = 0, limit: int = 100) -> List[models.Order]:
    """
    Retrieves a list of orders from the database,
    eagerly loading related location, services, and availability.
    """
    return (
        db.query(models.Order)
        .filter(models.Order.phone_identifier == phone_identifier)  # Filter by phone identifier
        .options(
            joinedload(models.Order.location),
            joinedload(models.Order.availability),
            selectinload(models.Order.services)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_order_by_id(db: Session, order_id: int) -> Optional[models.Order]:
    """
    Retrieves a single order by its ID,
    eagerly loading related location, services, and availability.
    """
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.location),
            joinedload(models.Order.availability),
            selectinload(models.Order.services)
        )
        .filter(models.Order.id == order_id)
        .first()
    )


# Example for creating an order (simplified, without full error handling):
def create_order(db: Session, order: schemas.OrderCreate) -> models.Order:
    db_location = db.query(models.Location).filter(models.Location.id == order.location_id).first()
    if not db_location:
        raise ValueError("Location not found")

    db_availability = db.query(models.Availability).filter(models.Availability.id == order.availability_id).first()
    if not db_availability:
        raise ValueError("Availability not found")

    db_services = db.query(models.Service).filter(models.Service.id.in_(order.service_ids)).all()
    if len(db_services) != len(order.service_ids):
        raise ValueError("One or more services not found")

    db_order = models.Order(
        plate_number=order.plate_number,
        phone_number=order.phone_number,
        location=db_location,
        availability=db_availability,
        services=db_services # Assign the list of service objects
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


# --- MODIFIED: Get available availabilities for the next 2 weeks ---
def get_available_availabilities(db: Session, start_date: datetime.date, end_date: datetime.date, skip: int = 0, limit: int = 100) -> List[models.Availability]:
    """
    Retrieves a list of availability slots that are not taken
    and fall within the next two weeks from the current date.
    """
    
    return (
        db.query(models.Availability)
        .filter(
            models.Availability.is_taken == False,
            models.Availability.date >= start_date, # Start from today
            models.Availability.date <= end_date # Up to two weeks from now
        )
        .order_by(models.Availability.date, models.Availability.time) # Optional: order by date/time
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_active_services(db: Session, skip: int = 0, limit: int = 100) -> List[models.Service]:
    """
    Retrieves a list of services that are currently active.
    """
    return (
        db.query(models.Service)
        .filter(models.Service.is_active == True) # Filter for is_active = True
        .order_by(models.Service.name) # Optional: order by service name
        .offset(skip)
        .limit(limit)
        .all()
    )