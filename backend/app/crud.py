# app/crud.py
import datetime
from typing import List, Optional
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select

from . import models, schemas

# All booking hours are expressed in this timezone, regardless of where the
# server runs. Stored values go to the DB as UTC (timestamptz).
BUSINESS_TZ = ZoneInfo("Europe/Berlin")


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
        email=(order.email or None),  # store None when not provided
        location=db_location,
        availability=db_availability,
        services=db_services, # Assign the list of service objects
    )
    db.add(db_order)
    db.flush() # Flush to get the db_order.id before committing

    # Store translation keys; the mobile app resolves them via i18n.
    process_steps = [
        {"name": "step.booking_confirmed.name",   "text": "step.booking_confirmed.text"},
        {"name": "step.cleaner_assigned.name",    "text": "step.cleaner_assigned.text"},
        {"name": "step.on_the_way.name",          "text": "step.on_the_way.text"},
        {"name": "step.cleaning_in_progress.name","text": "step.cleaning_in_progress.text"},
        {"name": "step.completed.name",           "text": "step.completed.text"},
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
    Retrieves a list of availability slots that are not taken,
    fall within the requested date range, and have not yet started.
    """
    now_utc = datetime.datetime.now(datetime.timezone.utc)

    return (
        db.query(models.Availability)
        .filter(
            models.Availability.is_taken == False,
            models.Availability.time >= start_date, # Start from today
            models.Availability.time <= end_date,   # Up to end of range
            models.Availability.time > now_utc,     # Hide slots already in the past
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


def bulk_create_availabilities_for_day(
    db: Session,
    target_date: datetime.date,
    start_hour: int = 8,
    end_hour: int = 17,
    step_minutes: int = 90,
) -> List[models.Availability]:
    """
    Creates availability slots for ``target_date`` starting at ``start_hour``:00
    Europe/Berlin time, in ``step_minutes`` intervals. Each slot must end at or
    before ``end_hour``:00 Berlin time. Slots already present for that Berlin
    calendar day (matched by Berlin hour+minute) are skipped, so the endpoint
    is safe to call repeatedly.

    Stored datetimes are timezone-aware (UTC in the timestamptz column).
    """
    # Build the day range in Berlin local time, then convert to UTC for DB ops.
    start_dt_local = datetime.datetime.combine(
        target_date, datetime.time(start_hour, 0), tzinfo=BUSINESS_TZ
    )
    end_dt_local = datetime.datetime.combine(
        target_date, datetime.time(end_hour, 0), tzinfo=BUSINESS_TZ
    )
    step = datetime.timedelta(minutes=step_minutes)

    candidates: List[datetime.datetime] = []
    current = start_dt_local
    while current + step <= end_dt_local:
        candidates.append(current.astimezone(datetime.timezone.utc))
        current += step

    if not candidates:
        return []

    # Existing slots for the Berlin calendar day, queried in UTC bounds.
    day_start_local = datetime.datetime.combine(
        target_date, datetime.time.min, tzinfo=BUSINESS_TZ
    )
    day_end_local = day_start_local + datetime.timedelta(days=1)
    day_start_utc = day_start_local.astimezone(datetime.timezone.utc)
    day_end_utc = day_end_local.astimezone(datetime.timezone.utc)

    existing = (
        db.query(models.Availability)
        .filter(
            models.Availability.time >= day_start_utc,
            models.Availability.time < day_end_utc,
        )
        .all()
    )
    # Compare on (hour, minute) in Berlin local to match how operators think.
    existing_hm = {
        (
            av.time.astimezone(BUSINESS_TZ).hour,
            av.time.astimezone(BUSINESS_TZ).minute,
        )
        for av in existing
        if av.time is not None
    }

    created: List[models.Availability] = []
    for slot_time_utc in candidates:
        local = slot_time_utc.astimezone(BUSINESS_TZ)
        if (local.hour, local.minute) in existing_hm:
            continue
        db_av = models.Availability(time=slot_time_utc, is_taken=False)
        db.add(db_av)
        created.append(db_av)

    db.commit()
    for av in created:
        db.refresh(av)
    return created


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


def update_order_status(db: Session, order_id: int, new_status: schemas.OrderStatusEnum) -> Optional[models.Order]:
    """
    Flip the top-level status of an order (open/completed/cancelled).
    When the new status is COMPLETED, every non-completed process step on the
    order is also marked completed so the UI stays consistent.
    Returns the updated order, or None if not found.
    """
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        return None

    db_order.status = new_status

    # Mark every step completed when the order is being completed.
    if new_status == schemas.OrderStatusEnum.COMPLETED:
        steps = (
            db.query(models.ProcessStep)
            .filter(models.ProcessStep.order_id == order_id)
            .all()
        )
        for step in steps:
            if getattr(step.status, "value", step.status) != "completed":
                step.status = models.ProcessStepStatusEnum.COMPLETED

    db.commit()
    db.refresh(db_order)
    return db_order


def update_process_step_status(db: Session, step_id: int, new_status: schemas.ProcessStepStatusEnum) -> Optional[models.ProcessStep]:
    db_step = db.query(models.ProcessStep).filter(models.ProcessStep.id == step_id).first()
    if db_step is None:
        return None

    # Normalize to the model's enum class so SQLAlchemy serializes consistently.
    new_status_model = models.ProcessStepStatusEnum(new_status.value)
    db_step.status = new_status_model
    # db_step.updated_at = datetime.datetime.utcnow()  # Update the timestamp
    db.commit()
    db.refresh(db_step)

    # If this update means every step on the order is now completed, auto-mark
    # the parent order as completed too (saves the cleaner a second click).
    if new_status_model == models.ProcessStepStatusEnum.COMPLETED:
        order = (
            db.query(models.Order)
            .filter(models.Order.id == db_step.order_id)
            .first()
        )
        if order is None:
            print(f"[auto-complete] step {step_id} has no parent order?", flush=True)
            return db_step

        # Compare on raw string values to sidestep any enum-class drift.
        all_steps = (
            db.query(models.ProcessStep)
            .filter(models.ProcessStep.order_id == order.id)
            .all()
        )
        statuses = [getattr(s.status, "value", s.status) for s in all_steps]
        all_done = bool(statuses) and all(v == "completed" for v in statuses)
        order_status_value = getattr(order.status, "value", order.status)
        print(
            f"[auto-complete] order={order.id} step={step_id} order_status={order_status_value} "
            f"step_statuses={statuses} all_done={all_done}",
            flush=True,
        )
        if all_done and order_status_value == "open":
            order.status = models.OrderStatusEnum.COMPLETED
            db.commit()
            db.refresh(order)
            print(f"[auto-complete] order={order.id} → completed", flush=True)

    return db_step