# clean-car-app

uvicorn main:app --reload

http://127.0.0.1:8000/docs

## Aelmbic 
alembic init migrations

Common Alembic Commands:

alembic init <directory>: Initializes Alembic for a project.
alembic revision -m "Message": Creates an empty migration script.
alembic revision --autogenerate -m "Message": Creates a migration script by comparing your models to the database.
alembic upgrade head: Applies all pending migrations up to the latest one.
alembic upgrade +1: Applies the next single migration.
alembic upgrade <revision_id>: Applies migrations up to a specific revision.
alembic downgrade -1: Reverts the last applied migration.
alembic downgrade base: Reverts all migrations.
alembic history: Shows a list of all migration scripts and their status.
alembic current: Shows the current revision applied to the database.
alembic stamp head: Marks the database as being at the latest revision without actually running any migrations (useful for initial setup if tables already exist).

alembic revision --autogenerate -m "Create items table"

alembic upgrade head