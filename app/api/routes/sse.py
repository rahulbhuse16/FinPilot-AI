from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.services.sse_service import sse_manager

import asyncio
import json
from collections.abc import AsyncGenerator


router = APIRouter(
    prefix="/sse",
    tags=["Real-Time Updates"],
)


def format_sse(event: str, data: dict) -> str:
    return (
        f"event: {event}\n"
        f"data: {json.dumps(data, default=str)}\n\n"
    )


async def event_stream(
    customer_id: str,
) -> AsyncGenerator[str, None]:

    queue = await sse_manager.connect(customer_id)

    try:

        yield format_sse(
            "connected",
            {
                "customer_id": customer_id,
            },
        )

        while True:

            try:

                message = await asyncio.wait_for(
                    queue.get(),
                    timeout=20,
                )

                print("[SSE] Sending:", message)

                yield format_sse(
                    message["event"],
                    message["data"],
                )

            except asyncio.TimeoutError:

                yield ": heartbeat\n\n"

    except asyncio.CancelledError:
        print(f"[SSE] Client disconnected: {customer_id}")
        raise

    finally:

        sse_manager.disconnect(
            customer_id,
            queue,
        )


@router.get("/stream")
async def stream_events(customer_id: str):

    return StreamingResponse(
        event_stream(customer_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )