# app/services/push_service.py

import json
import logging

from pywebpush import WebPushException, webpush

from app.core.config import settings


logger = logging.getLogger(__name__)


class WebPushManager:

    def __init__(self):
        self.subscriptions: dict[str, list[dict]] = {}

    def subscribe(
        self,
        customer_id: str,
        subscription: dict,
    ) -> None:

        subscriptions = self.subscriptions.setdefault(
            customer_id,
            [],
        )

        endpoint = subscription.get("endpoint")

        # Avoid duplicate subscriptions
        for existing in subscriptions:
            if existing.get("endpoint") == endpoint:
                return

        subscriptions.append(subscription)

        print(
            f"🟢 WEB PUSH SUBSCRIBED | "
            f"customer={customer_id} | "
            f"subscriptions={len(subscriptions)}"
        )

    def unsubscribe(
        self,
        customer_id: str,
        endpoint: str,
    ) -> None:

        subscriptions = self.subscriptions.get(
            customer_id,
            [],
        )

        self.subscriptions[customer_id] = [
            subscription
            for subscription in subscriptions
            if subscription.get("endpoint") != endpoint
        ]

    def publish(
        self,
        customer_id: str,
        title: str,
        body: str,
        url: str = "/",
    ) -> None:

        print(
            f"📢 WEB PUSH PUBLISH | "
            f"customer={customer_id}"
        )

        subscriptions = self.subscriptions.get(
            customer_id,
            [],
        )

        print(
            f"📡 PUSH SUBSCRIPTIONS: "
            f"{len(subscriptions)}"
        )

        if not subscriptions:
            print(
                f"⚠️ NO PUSH SUBSCRIPTION | "
                f"customer={customer_id}"
            )
            return

        payload = json.dumps({
            "title": title,
            "body": body,
            "url": url,
        })

        for subscription in list(subscriptions):

            try:

                webpush(
                    subscription_info=subscription,
                    data=payload,
                    vapid_private_key=settings.vapid_private_key,
                    vapid_claims={
                        "sub": settings.vapid_email,
                    },
                )

                print(
                    f"✅ WEB PUSH SENT | "
                    f"customer={customer_id}"
                )

            except WebPushException as exc:

                print(
                    f"❌ WEB PUSH FAILED | "
                    f"customer={customer_id} | "
                    f"error={exc}"
                )

                # Subscription expired / invalid
                if (
                    exc.response
                    and exc.response.status_code
                    in (404, 410)
                ):
                    endpoint = subscription.get(
                        "endpoint"
                    )

                    self.unsubscribe(
                        customer_id,
                        endpoint,
                    )


web_push_manager = WebPushManager()