from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import User
from app.schemas.assistant import (
    AssistantRequest,
    AssistantResponse,
)
from app.services.assistance_service import (
    run_financial_analysis,
)


router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"],
)


@router.post(
    "/chat",
    response_model=AssistantResponse,
)
async def chat_with_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ask FinPilot AI a financial question.

    No conversation history is stored or sent.

    The authenticated user's customer ID is used as the
    customer context.
    """

    if current_user.customer_id is None:
        return AssistantResponse(
            answer="Your account is not linked to a customer profile.",
            tools_used=[],
        )

    result = await run_financial_analysis(
        session=db,
        question=request.question,
        customer_id=str(current_user.customer_id),
    )

    return AssistantResponse(
        answer=result["answer"],
        tools_used=result["tools_used"],
    )