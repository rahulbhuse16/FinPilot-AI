from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class AIInsight(BaseModel):
    category: str
    title: str
    description: str
    severity: Literal[
        "positive",
        "warning",
        "danger",
    ]
    customer_id: UUID | None = None


class AIInsightsResponse(BaseModel):
    insights: list[AIInsight]