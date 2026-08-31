from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import ForeignKey, Numeric, String, func, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.customer import Customer


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    customer_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        index=True,
    )
    account_number: Mapped[str] = mapped_column(String(50), unique=True)
    account_type: Mapped[str] = mapped_column(String(30))
    balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        server_default=text("0"),
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        server_default=text("'INR'"),
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'ACTIVE'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )

    customer: Mapped[Customer] = relationship(back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        back_populates="account",
        cascade="all, delete-orphan",
    )
