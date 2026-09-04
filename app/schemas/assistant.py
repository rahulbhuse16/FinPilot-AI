from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Customer's financial question",
    )


class AssistantResponse(BaseModel):
    answer: str
    tools_used: list[str]