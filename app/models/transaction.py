from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import ForeignKey, Numeric, String, Text, func, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.account import Account
from app.models.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    account_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("accounts.id", ondelete="CASCADE"),
        index=True,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    transaction_type: Mapped[str] = mapped_column(String(20))
    category: Mapped[str | None] = mapped_column(String(50))
    merchant: Mapped[str | None] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(Text)
    transaction_time: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )

    account: Mapped[Account] = relationship(back_populates="transactions")
