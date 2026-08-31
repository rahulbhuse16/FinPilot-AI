from uuid import UUID

from fastapi import APIRouter, HTTPException

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
):

    async with get_db() as session:

        history = await get_conversation_messages(
            session,
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

        await add_message(
            session=session,
            conversation_id=request.conversation_id,
            role="user",
            content=request.question,
        )

        result = await run_financial_analysis(
            session=session,
            question=request.question,
            customer_id=(
                str(request.customer_id)
                if request.customer_id
                else None
            ),
            history=history_for_llm,
        )

        await add_message(
            session=session,
            conversation_id=request.conversation_id,
            role="assistant",
            content=result["answer"],
        )

        await session.commit()

    return {
        "answer": result["answer"],
        "sources": [],
        "tools_used": result["tools_used"],
    }