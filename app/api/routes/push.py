# app/api/routes/push.py

from fastapi import APIRouter

from app.services.push_service import web_push_manager


router = APIRouter(
    prefix="/push",
    tags=["Web Push"],
)


@router.post("/subscribe")
async def subscribe(
    customer_id: str,
    subscription: dict,
):

    web_push_manager.subscribe(
        customer_id=customer_id,
        subscription=subscription,
    )

    return {
        "message": "Push subscription registered"
    }

@router.post("/test")
async def test_push(customer_id: str):

    web_push_manager.publish(
        customer_id=customer_id,
        title="FinPilot Test Notification",
        body="🎉 Web Push is working!",
        url="/",
    )

    return {
        "message": "Test push sent",
        "customer_id": customer_id,
    }