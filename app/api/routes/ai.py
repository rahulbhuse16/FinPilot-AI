from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

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
    db: Session = Depends(get_db),
):
    result = await answer_question(
        session=db,
        question=request.question,
    )

    return result