from uuid import UUID

from pydantic import BaseModel, Field


class AnalystRequest(BaseModel):
    conversation_id: UUID

    customer_id: UUID | None = None

    question: str = Field(
        min_length=3,
        max_length=2000,
    )


class AnalystSource(BaseModel):
    type: str
    source: str
    page_number: int | None = None


class AnalystResponse(BaseModel):
    answer: str

    sources: list[AnalystSource]

    tools_used: list[str]