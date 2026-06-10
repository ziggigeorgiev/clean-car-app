"""Add brand (white-label), service quantity, and make plate_number nullable

Revision ID: f1a2b3c4d5e6
Revises: c9d4e7a8b021
Create Date: 2026-06-10 00:00:00.000000

White-label support:
  * services.brand and orders.brand (enum brandenum) — existing rows backfilled
    to 'CAR' so the original car app keeps its full catalog/order history.
  * order_service_association.quantity — number of units per booked service
    (defaults to 1; the car app always books 1).
  * orders.plate_number made nullable — the home (couch/mattress) app has no
    vehicle plate.

NOTE: PostgreSQL enum types store the SQLAlchemy member NAMES, matching the
existing orderstatusenum / servicecategoryenum migrations (e.g. 'CAR', 'HOME').
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'c9d4e7a8b021'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

brand_enum_values = ['CAR', 'HOME']
brand_enum_name = 'brandenum'  # must match the name SQLAlchemy generates
brand_enum_type = sa.Enum(*brand_enum_values, name=brand_enum_name)


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Create the brand enum type once, then add the columns (nullable first
    #    so we can backfill existing rows, then flip to NOT NULL).
    brand_enum_type.create(bind, checkfirst=True)

    op.add_column('services', sa.Column('brand', brand_enum_type, nullable=True))
    op.add_column('orders', sa.Column('brand', brand_enum_type, nullable=True))

    op.execute("UPDATE services SET brand = 'CAR' WHERE brand IS NULL")
    op.execute("UPDATE orders SET brand = 'CAR' WHERE brand IS NULL")

    op.alter_column('services', 'brand', existing_type=brand_enum_type,
                    nullable=False, server_default='CAR')
    op.alter_column('orders', 'brand', existing_type=brand_enum_type,
                    nullable=False, server_default='CAR')

    op.create_index(op.f('ix_services_brand'), 'services', ['brand'], unique=False)
    op.create_index(op.f('ix_orders_brand'), 'orders', ['brand'], unique=False)

    # 2. Quantity on the order/service association (defaults to 1).
    op.add_column(
        'order_service_association',
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
    )

    # 3. The home app has no plate — relax the NOT NULL constraint.
    op.alter_column('orders', 'plate_number',
                    existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column('orders', 'plate_number',
                    existing_type=sa.String(), nullable=False)

    op.drop_column('order_service_association', 'quantity')

    op.drop_index(op.f('ix_orders_brand'), table_name='orders')
    op.drop_index(op.f('ix_services_brand'), table_name='services')
    op.drop_column('orders', 'brand')
    op.drop_column('services', 'brand')

    brand_enum_type.drop(op.get_bind(), checkfirst=True)
