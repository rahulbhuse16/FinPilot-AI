from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analyst import (
    AnalystRequest,
    AnalystResponse,
)
from app.services.analyst_agent import (
    run_financial_analysis,
)
from app.services.conversation_service import (
    add_message,
    get_conversation_messages,
)


router = APIRouter(
    prefix="/analyst",
    tags=["AI Financial Analyst"],
)


@router.post(
    "/ask",
    response_model=AnalystResponse,
)
async def ask_financial_analyst(
    request: AnalystRequest,
    db: Session = Depends(get_db),
):

    history = get_conversation_messages(
        db,
        request.conversation_id,
        limit=20,
    )

    history_for_llm = [
        {
            "role": message["role"],
            "content": message["content"],
        }
        for message in history
    ]

    add_message(
        session=db,
        conversation_id=request.conversation_id,
        role="user",
        content=request.question,
    )

    result = await run_financial_analysis(
        session=db,
        question=request.question,
        customer_id=(
            str(request.customer_id)
            if request.customer_id
            else None
        ),
        history=history_for_llm,
    )

    add_message(
        session=db,
        conversation_id=request.conversation_id,
        role="assistant",
        content=result["answer"],
    )

    return {
        "answer": result["answer"],
        "sources": [],
        "tools_used": result["tools_used"],
    }