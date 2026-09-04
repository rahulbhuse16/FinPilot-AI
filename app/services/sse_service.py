import asyncio
from collections import defaultdict


class SSEManager:
    def __init__(self):
        self.connections: dict[str, set[asyncio.Queue]] = defaultdict(set)

    async def connect(self, customer_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()

        self.connections[customer_id].add(queue)

        print(
            f"🟢 SSE CONNECTED | customer={customer_id} "
            f"| connections={len(self.connections[customer_id])}"
        )

        print(
            "👥 ALL CONNECTED CUSTOMERS:",
            list(self.connections.keys()),
        )

        return queue

    def disconnect(
        self,
        customer_id: str,
        queue: asyncio.Queue,
    ) -> None:

        queues = self.connections.get(customer_id)

        if not queues:
            return

        queues.discard(queue)

        if not queues:
            del self.connections[customer_id]

        print(
            f"🔴 SSE DISCONNECTED | customer={customer_id}"
        )

    async def publish(
        self,
        customer_id: str,
        event: str,
        data: dict,
    ) -> None:

        print(
            f"📢 SSE PUBLISH | customer={customer_id} "
            f"| event={event}"
        )

        print(
            "👥 ALL CONNECTED CUSTOMERS:",
            list(self.connections.keys()),
        )

        queues = self.connections.get(customer_id, set())

        print(
            f"📡 MATCHING CONNECTIONS: {len(queues)}"
        )

        if not queues:
            print(
                f"⚠️ NO ACTIVE SSE CONNECTION "
                f"FOR CUSTOMER: {customer_id}"
            )
            return

        message = {
            "event": event,
            "data": data,
        }

        for queue in list(queues):
            await queue.put(message)

        print(
            f"✅ SSE EVENT QUEUED | "
            f"customer={customer_id} | "
            f"event={event} | "
            f"connections={len(queues)}"
        )


# IMPORTANT: create only ONE global instance
sse_manager = SSEManager()