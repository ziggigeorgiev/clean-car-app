import logging
import os
import secrets
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from fastapi import FastAPI, Depends, HTTPException, Response, status, BackgroundTasks, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Dict, Optional

from app import models, schemas, crud
from app.database import engine, get_db, Base # Import Base for table creation
from app.email_service import send_booking_confirmation

# Uvicorn configures the root logger AFTER our module loads, which can swallow
# basicConfig(). Attach a dedicated stream handler to our app/email loggers so
# their output reliably reaches stdout on Render.
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
for _name in (__name__, "app.email_service"):
    _l = logging.getLogger(_name)
    _l.setLevel(logging.INFO)
    if not any(isinstance(h, logging.StreamHandler) for h in _l.handlers):
        _l.addHandler(_handler)
    _l.propagate = False
logger = logging.getLogger(__name__)

app = FastAPI()

# --- Web UI templates ---------------------------------------------------------
TEMPLATES_DIR = Path(__file__).parent / "templates"
print(
    f"[startup] templates dir={TEMPLATES_DIR} exists={TEMPLATES_DIR.exists()} "
    f"contents={sorted(p.name for p in TEMPLATES_DIR.iterdir()) if TEMPLATES_DIR.exists() else 'N/A'}",
    flush=True,
)
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))
BERLIN_TZ = ZoneInfo("Europe/Berlin")


def _format_when(value) -> str:
    """Render a datetime (assumed UTC if naive) in Europe/Berlin local time."""
    if value is None:
        return "—"
    if isinstance(value, datetime):
        dt = value if value.tzinfo else value.replace(tzinfo=ZoneInfo("UTC"))
        return dt.astimezone(BERLIN_TZ).strftime("%A, %B %d, %Y at %H:%M")
    return str(value)


templates.env.globals["format_when"] = _format_when


# --- Cleaner auth (HTTP Basic) ------------------------------------------------
# Credentials come from env vars so they're not committed to git:
#   CLEANER_USERNAME, CLEANER_PASSWORD
# If either is unset, the cleaner pages return 503 with a clear message rather
# than being accessible without auth.
_basic_auth = HTTPBasic()


def require_cleaner_auth(credentials: HTTPBasicCredentials = Depends(_basic_auth)) -> str:
    expected_user = os.getenv("CLEANER_USERNAME")
    expected_pass = os.getenv("CLEANER_PASSWORD")
    if not expected_user or not expected_pass:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cleaner area is not configured. Set CLEANER_USERNAME and CLEANER_PASSWORD.",
        )
    # constant-time comparison to avoid timing attacks
    user_ok = secrets.compare_digest(credentials.username.encode("utf-8"), expected_user.encode("utf-8"))
    pass_ok = secrets.compare_digest(credentials.password.encode("utf-8"), expected_pass.encode("utf-8"))
    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": 'Basic realm="CleanCar cleaner"'},
        )
    return credentials.username

# Create database tables on startup (for development/testing)
# For production, use Alembic for migrations
# @app.on_event("startup")
# def on_startup():
#     models.Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Web UI: policy pages
# ---------------------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
async def web_root(request: Request):
    """Tiny landing page so '/' isn't a 404."""
    return templates.TemplateResponse(request, "base.html", {})


@app.get("/terms", response_class=HTMLResponse)
async def web_terms(request: Request):
    return templates.TemplateResponse(
        request, "terms.html", {"today": date.today().isoformat()},
    )


@app.get("/privacy", response_class=HTMLResponse)
async def web_privacy(request: Request):
    return templates.TemplateResponse(
        request, "privacy.html", {"today": date.today().isoformat()},
    )


@app.get("/cancellation", response_class=HTMLResponse)
async def web_cancellation(request: Request):
    return templates.TemplateResponse(
        request, "cancellation.html", {"today": date.today().isoformat()},
    )


# ---------------------------------------------------------------------------
# Web UI: cleaner dashboard
# ---------------------------------------------------------------------------
def _load_order_for_cleaner(db: Session, order_uuid: str) -> Optional[models.Order]:
    return (
        db.query(models.Order)
        .filter(models.Order.uuid == order_uuid)
        .options(
            joinedload(models.Order.location),
            joinedload(models.Order.availability),
            selectinload(models.Order.services),
            selectinload(models.Order.process_steps),
        )
        .first()
    )


@app.get("/cleaner", response_class=HTMLResponse)
async def cleaner_index(_user: str = Depends(require_cleaner_auth)):
    return RedirectResponse(url="/cleaner/orders")


@app.get("/cleaner/orders", response_class=HTMLResponse)
async def cleaner_orders(
    request: Request,
    db: Session = Depends(get_db),
    _user: str = Depends(require_cleaner_auth),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.status == models.OrderStatusEnum.OPEN)
        .options(
            joinedload(models.Order.location),
            joinedload(models.Order.availability),
        )
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return templates.TemplateResponse(
        request, "cleaner_orders.html", {"orders": orders},
    )


@app.get("/cleaner/orders/{order_uuid}", response_class=HTMLResponse)
async def cleaner_order_detail(
    request: Request,
    order_uuid: str,
    ok: Optional[str] = None,
    err: Optional[str] = None,
    db: Session = Depends(get_db),
    _user: str = Depends(require_cleaner_auth),
):
    order = _load_order_for_cleaner(db, order_uuid)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    flash = None
    if ok:
        flash = {"kind": "ok", "message": ok}
    elif err:
        flash = {"kind": "err", "message": err}
    return templates.TemplateResponse(
        request, "cleaner_order_detail.html", {"order": order, "flash": flash},
    )


@app.post("/cleaner/orders/{order_uuid}/steps/{step_id}/status/{new_status}")
async def cleaner_update_step(
    order_uuid: str,
    step_id: int,
    new_status: schemas.ProcessStepStatusEnum,
    db: Session = Depends(get_db),
    _user: str = Depends(require_cleaner_auth),
):
    # Resolve the order via its uuid, then check the step belongs to it. This
    # prevents URLs from being forged to update steps from someone else's order.
    order = db.query(models.Order).filter(models.Order.uuid == order_uuid).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    step = db.query(models.ProcessStep).filter(models.ProcessStep.id == step_id).first()
    if step is None or step.order_id != order.id:
        return RedirectResponse(
            url=f"/cleaner/orders/{order_uuid}?err=Step+not+found+on+this+order",
            status_code=303,
        )
    crud.update_process_step_status(db=db, step_id=step_id, new_status=new_status)
    return RedirectResponse(
        url=f"/cleaner/orders/{order_uuid}?ok=Step+'{step.name}'+updated+to+{new_status.value}",
        status_code=303,
    )


# ---------------------------------------------------------------------------
# Existing JSON API
# ---------------------------------------------------------------------------
@app.get( # Changed from @app.post to @app.get
    "/api/health",
    status_code=status.HTTP_204_NO_CONTENT, # Still returns 204 No Content
    summary="Health Check Endpoint",
    description="Checks the health of the API. Returns 204 No Content on success."
)
async def health_check():
    """
    This endpoint performs a simple health check.
    It returns an HTTP 204 No Content status code if the API is operational.
    No response body is returned.
    """
    # In a real application, you might add logic here to check database
    # connections, external services, or other dependencies.
    # For this example, we simply return a successful status.
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Get All Orders Endpoint
@app.get(
    "/api/orders/get/phone_identifier/{phone_identifier}",
    response_model=List[schemas.Order],
    summary="Get All Orders",
    description="Retrieves a list of all orders with their associated location, services, and availability."
)
async def read_orders(phone_identifier: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = crud.get_orders(db, phone_identifier, skip=skip, limit=limit)
    return orders

# Get Order By ID Endpoint (NEW)
@app.get(
    "/api/orders/get/phone_identifier/{phone_identifier}/id/{order_id}",
    response_model=schemas.Order, # Response model is a single Order object
    summary="Get Order by ID",
    description="Retrieves a single order by its unique ID, including associated location, services, and availability."
)
async def read_order_by_id(phone_identifier: str, order_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single order from the database by its ID.

    - **order_id**: The unique integer ID of the order to retrieve.
    """
    print("Fetching order with ID:", order_id)  # Debugging line
    db_order = crud.get_order_by_phone_identifier_and_id(db, phone_identifier=phone_identifier, order_id=order_id)
    if db_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return db_order


# Create Order Endpoint
@app.put(
    "/api/orders/create",
    response_model=schemas.Order,
    status_code=status.HTTP_201_CREATED,
    summary="Create a New Order",
    description="Creates a new order with specified plate number, phone, location, availability, and services."
)
async def create_new_order(
    order: schemas.OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        db_order = crud.create_order(db=db, order=order)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Schedule the confirmation email AFTER the response is returned so the
    # client never waits for SMTP. Failures inside the task are logged but
    # never affect the order response.
    # NOTE: we also print() because uvicorn's log handler sometimes swallows
    # third-party logger output on hosting providers.
    print(f"[order_create] order={db_order.id} email={order.email!r}", flush=True)
    if order.email:
        try:
            total = sum((s.price or 0) for s in db_order.services)
            currency = (
                db_order.services[0].currency.value
                if db_order.services and db_order.services[0].currency is not None
                else "EUR"
            )
            email_args = dict(
                to=order.email,
                order_id=db_order.id,
                plate_number=db_order.plate_number,
                phone_number=db_order.phone_number,
                address=db_order.location.address if db_order.location else "",
                availability_time=db_order.availability.time if db_order.availability else None,
                service_names=[s.name for s in db_order.services],
                total_price=total if db_order.services else None,
                currency=currency,
            )
            logger.info("Queueing booking confirmation email for order %s to %s", db_order.id, order.email)
            print(f"[order_create] queueing email for order {db_order.id}", flush=True)
            background_tasks.add_task(send_booking_confirmation, **email_args)
        except Exception as e:
            logger.exception("Failed to queue confirmation email for order %s", db_order.id)
            print(f"[order_create] ERROR queueing email: {e}", flush=True)
    else:
        logger.info("Order %s created with no email — skipping confirmation email", db_order.id)
        print(f"[order_create] order={db_order.id} no email on payload", flush=True)

    return db_order


# Get Available Availabilities Endpoint
@app.get(
    "/api/availabilities/get",
    response_model=Dict[date, List[schemas.Availability]],
    summary="Get Available Availabilities",
    description="Retrieves a list of all availability slots that are not yet taken, filtered for the next two weeks."
)
async def read_available_availabilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    start_date = date.today()
    end_date = start_date + timedelta(weeks=2)

    result = {}

    current = start_date
    while current <= end_date:
        result[current] = []
        current += timedelta(days=1)
    availabilities = crud.get_available_availabilities(db, start_date=start_date, end_date=end_date)
    for availability in availabilities:
        result[availability.time.date()].append(availability)
    return result


@app.get(
    "/api/availabilities/get/{availability_id}",
    response_model=schemas.Availability,
    summary="Get Available Availability by id",
    description="Retrieves an availability slot by id."
)
async def read_availability(availability_id: int, db: Session = Depends(get_db)):
    db_availability = crud.get_availability_by_id(db, availability_id=availability_id)
    if db_availability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    return db_availability


# Create Availability Endpoint
@app.put(
    "/api/availabilities/create",
    response_model=schemas.Availability,
    status_code=status.HTTP_201_CREATED,
    summary="Create a New Availability Slot",
    description="Creates a new availability slot."
)
async def create_availability_slot(availability: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    db_availability = crud.create_availability(db=db, availability=availability)
    return db_availability


# Bulk Create Availabilities For a Day Endpoint
@app.post(
    "/api/availabilities/bulk_create_for_day",
    response_model=List[schemas.Availability],
    status_code=status.HTTP_201_CREATED,
    summary="Bulk Create Availabilities For a Day",
    description=(
        "Generates availability slots for the given day from 08:00 to 17:00 "
        "at 90-minute intervals. Each slot must end at or before 17:00. "
        "Slots already present for that day are skipped, so the endpoint is "
        "safe to call repeatedly. The interval and bounds can be overridden "
        "via query parameters."
    ),
)
async def bulk_create_availabilities_for_day(
    day: date,
    start_hour: int = 8,
    end_hour: int = 17,
    step_minutes: int = 90,
    db: Session = Depends(get_db),
):
    """
    - **day**: target date in `YYYY-MM-DD` format (query param).
    - **start_hour** / **end_hour** / **step_minutes**: optional overrides.

    Returns the list of newly created availability slots (empty list if all
    slots for the day already exist).
    """
    if not (0 <= start_hour < end_hour <= 24):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Require 0 <= start_hour < end_hour <= 24",
        )
    if step_minutes <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="step_minutes must be positive",
        )
    return crud.bulk_create_availabilities_for_day(
        db=db,
        target_date=day,
        start_hour=start_hour,
        end_hour=end_hour,
        step_minutes=step_minutes,
    )

# Get Active Services Endpoint
@app.get(
    "/api/services/get",
    response_model=List[schemas.Service], # Response is a list of Service schemas
    summary="Get Active Services",
    description="Retrieves a list of all services that are currently active (is_active = True)."
)
async def read_active_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of services that are marked as active.
    Supports pagination using `skip` and `limit` parameters.
    """
    active_services = crud.get_active_services(db, skip=skip, limit=limit)
    return active_services


@app.put(
    "/api/services/create",
    response_model=schemas.Service,
    status_code=status.HTTP_201_CREATED,
    summary="Create a New Service",
    description="Creates a new service."
)
async def create_service_entry(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = crud.create_service(db=db, service=service)
    return db_service


@app.put(
    "/api/process_steps/{step_id}/status/{status}",
    response_model=schemas.ProcessStep, # Return the updated step
    summary="Update Process Step Status",
    description="Modifies the status of a specific process step by its ID."
)
async def update_process_step(
    step_id: int,
    status: schemas.ProcessStepStatusEnum,
    db: Session = Depends(get_db)
):
    """
    Updates the status of a process step.

    - **step_id**: The unique integer ID of the process step to update.
    - **status**: The new status (e.g., "in_progress", "completed", "failed").
    """
    db_step = crud.update_process_step_status(db=db, step_id=step_id, new_status=status)
    if db_step is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process step not found"
        )
    return db_step








# @app.post("/items/", response_model=schemas.Item)
# def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
#     return crud.create_item(db=db, item=item)

# @app.get("/items/", response_model=List[schemas.Item])
# def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     items = crud.get_items(db, skip=skip, limit=limit)
#     return items

# @app.get("/items/{item_id}", response_model=schemas.Item)
# def read_item(item_id: int, db: Session = Depends(get_db)):
#     db_item = crud.get_item(db, item_id=item_id)
#     if db_item is None:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return db_item

# # Example of an update endpoint (add more error handling)
# @app.put("/items/{item_id}", response_model=schemas.Item)
# def update_item(item_id: int, item_update: schemas.ItemCreate, db: Session = Depends(get_db)):
#     db_item = crud.get_item(db, item_id=item_id)
#     if db_item is None:
#         raise HTTPException(status_code=404, detail="Item not found")

#     for key, value in item_update.model_dump(exclude_unset=True).items():
#         setattr(db_item, key, value)
#     db.add(db_item)
#     db.commit()
#     db.refresh(db_item)
#     return db_item

# # Example of a delete endpoint (add more error handling)
# @app.delete("/items/{item_id}")
# def delete_item(item_id: int, db: Session = Depends(get_db)):
#     db_item = crud.get_item(db, item_id=item_id)
#     if db_item is None:
#         raise HTTPException(status_code=404, detail="Item not found")
#     db.delete(db_item)
#     db.commit()
#     return {"message": "Item deleted successfully"}