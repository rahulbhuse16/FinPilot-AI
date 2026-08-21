from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CreateConversationRequest(BaseModel):
    customer_id: UUID | None = None
    title: str | None = Field(
        default=None,
        max_length=255,
    )


class ConversationResponse(BaseModel):
    id: UUID
    customer_id: UUID | None
    title: str | None
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime