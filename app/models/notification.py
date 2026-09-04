from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, String, Text, func, text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    notification_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
    )

    message: Mapped[str] = mapped_column(
        Text,
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("FALSE"),
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        index=True,
    )

    user = relationship(
        "User",
        back_populates="notifications",
    )