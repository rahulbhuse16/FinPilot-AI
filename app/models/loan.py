from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import ForeignKey, Numeric, String, Text, func, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.customer import Customer


class Loan(Base):
    __tablename__ = "loans"

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
    loan_type: Mapped[str] = mapped_column(String(50))
    principal_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    outstanding_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    interest_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    monthly_emi: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    salary_slip_url: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
)
    status: Mapped[str] = mapped_column(
        String(30),
        server_default=text("'ACTIVE'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )

    customer: Mapped[Customer] = relationship(back_populates="loans")
