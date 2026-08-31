from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Numeric, String, func, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    customer_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
    )
    full_name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    monthly_income: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        server_default=text("0"),
    )
    credit_score: Mapped[int | None]
    risk_level: Mapped[str | None] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )

    accounts: Mapped[list["Account"]] = relationship(  # noqa: F821
        back_populates="customer",
        cascade="all, delete-orphan",
    )
    loans: Mapped[list["Loan"]] = relationship(  # noqa: F821
        back_populates="customer",
        cascade="all, delete-orphan",
    )
