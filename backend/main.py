from datetime import date, timedelta
from fastapi import FastAPI, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List, Dict

from app import models, schemas, crud
from app.database import engine, get_db, Base # Import Base for table creation

app = FastAPI()

# Create database tables on startup (for development/testing)
# For production, use Alembic for migrations
# @app.on_event("startup")
# def on_startup():
#     models.Base.metadata.create_all(bind=engine)

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
async def create_new_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        db_order = crud.create_order(db=db, order=order)
        return db_order
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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