"""Add uuid column to orders

Revision ID: b2f01a9c4d33
Revises: a796fe7e1947
Create Date: 2026-06-01 13:30:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2f01a9c4d33'
down_revision: Union[str, Sequence[str], None] = 'a796fe7e1947'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Add the column as nullable so we can backfill existing rows.
    op.add_column('orders', sa.Column('uuid', sa.String(length=36), nullable=True))

    # 2. Backfill every existing row with a fresh random UUIDv4.
    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id FROM orders WHERE uuid IS NULL")).fetchall()
    for (order_id,) in rows:
        bind.execute(
            sa.text("UPDATE orders SET uuid = :u WHERE id = :id"),
            {"u": str(uuid.uuid4()), "id": order_id},
        )

    # 3. Enforce NOT NULL + uniqueness + index now that data is consistent.
    op.alter_column('orders', 'uuid', nullable=False)
    op.create_unique_constraint('uq_orders_uuid', 'orders', ['uuid'])
    op.create_index('ix_orders_uuid', 'orders', ['uuid'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_orders_uuid', table_name='orders')
    op.drop_constraint('uq_orders_uuid', 'orders', type_='unique')
    op.drop_column('orders', 'uuid')
