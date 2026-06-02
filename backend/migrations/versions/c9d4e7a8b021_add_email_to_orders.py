"""Add optional email column to orders

Revision ID: c9d4e7a8b021
Revises: b2f01a9c4d33
Create Date: 2026-06-01 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9d4e7a8b021'
down_revision: Union[str, Sequence[str], None] = 'b2f01a9c4d33'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('orders', sa.Column('email', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('orders', 'email')
