from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.core.database import get_db
from app.schemas.rag import RAGResponse
from app.services.rag_service import answer_question


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


class AskRequest(BaseModel):
    question: str = Field(
        min_length=3,
        max_length=2000,
    )


@router.post(
    "/ask",
    response_model=RAGResponse,
)
async def ask_ai(
    request: AskRequest,
):

    async with get_db() as session:

        result = await answer_question(
            session=session,
            question=request.question,
        )

    return result