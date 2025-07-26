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
        .order_by(models.Order.created_at.desc())  # Optional: order by creation date
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_order_by_phone_identifier_and_id(db: Session, phone_identifier: str, order_id: int) -> Optional[models.Order]:
    """
    Retrieves a single order by its ID,
    eagerly loading related location, services, and availability.
    """
    print("Fetching order with ID:", order_id)  # Debugging line
    return (
        db.query(models.Order)
        .filter(
            models.Order.phone_identifier == phone_identifier,  # Ensure the order belongs to the user
            models.Order.id == order_id
        )
        .options(
            joinedload(models.Order.location),
            joinedload(models.Order.availability),
            selectinload(models.Order.services)
        )
        .first()
    )


# Example for creating an order (simplified, without full error handling):
def create_order(db: Session, order: schemas.OrderCreate) -> models.Order:
    
    db_availability = db.query(models.Availability).filter(models.Availability.id == order.availability_id).first()
    db_availability = db_availability if db_availability and not db_availability.is_taken else None
    if not db_availability:
        raise ValueError("Availability not found")
    db_availability.is_taken = True  # Mark as taken

    db_services = db.query(models.Service).filter(models.Service.id.in_(order.service_ids)).all()
    if len(db_services) != len(order.service_ids):
        raise ValueError("One or more services not found")

    db_location = models.Location(
        address=order.location.address,
        longitude=order.location.longitude,
        latitude=order.location.latitude
    )
    db.add(db_location)

    db_order = models.Order(
        phone_identifier=order.phone_identifier,
        plate_number=order.plate_number,
        phone_number=order.phone_number,
        location=db_location,
        availability=db_availability,
        services=db_services, # Assign the list of service objects
    )
    db.add(db_order)
    db.flush() # Flush to get the db_order.id before committing

    process_steps = [
        {
            "name": "Booking confirmed",
            "text": "We are looking for an availalble cleaner",
        },
        {
            "name": "Cleaner assigned",
            "text": "We will inform you when the cleaner is on the way",
        },
        {
            "name": "On the way",
            "text": "Cleaner is going to call you when he arrives",
        },
        {
            "name": "Cleaning in progress",
            "text": "Almost done, please be patient",
        },
        {
            "name": "Completed",
            "text": "Thanks for your order, we hope you are satisfied",
        }
    ]
    for process_step in process_steps:
        db_process_step = models.ProcessStep(
            name=process_step['name'],
            text=process_step['text'],
            status=schemas.ProcessStepStatusEnum.PENDING,
            order_id=db_order.id
        )
        db.add(db_process_step)

    db.commit()
    db.refresh(db_order)
    return db_order


# --- MODIFIED: Get available availabilities for the next 2 weeks ---
def get_availability_by_id(db: Session, availability_id: int):
    return (
        db.query(models.Availability)
        .filter(models.Availability.id == availability_id)
        .first()
    )

def get_available_availabilities(db: Session, start_date: datetime.date, end_date: datetime.date, skip: int = 0, limit: int = 100) -> List[models.Availability]:
    """
    Retrieves a list of availability slots that are not taken
    and fall within the next two weeks from the current date.
    """
    
    return (
        db.query(models.Availability)
        .filter(
            models.Availability.is_taken == False,
            models.Availability.time >= start_date, # Start from today
            models.Availability.time <= end_date # Up to two weeks from now
        )
        .order_by(models.Availability.time) # Optional: order by date/time
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_availability(db: Session, availability: schemas.AvailabilityCreate) -> models.Availability:
    db_availability = models.Availability(
        time=availability.time,
        is_taken=availability.is_taken
    )
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability


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


def create_service(db: Session, service: schemas.ServiceCreate) -> models.Service:
    db_service = models.Service(
        category=service.category,
        name=service.name,
        description=service.description,
        price=service.price,
        currency=service.currency,
        is_active=service.is_active
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def update_process_step_status(db: Session, step_id: int, new_status: schemas.ProcessStepStatusEnum) -> Optional[models.ProcessStep]:
    db_step = db.query(models.ProcessStep).filter(models.ProcessStep.id == step_id).first()
    if db_step:
        db_step.status = new_status
        # db_step.updated_at = datetime.datetime.utcnow()  # Update the timestamp
        db.commit()
        db.refresh(db_step)
    return db_step