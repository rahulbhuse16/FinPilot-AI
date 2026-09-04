import { useCallback, useEffect, useRef, useState } from "react";
import { baseURL } from "../api/axios";
import { useAppDispatch } from "../store/hooks";
import { fetchNotifications } from "../store/notifications";

export type SSEEvent = {
  type: string;
  data: unknown;
};

type UseSSEResult = {
  connected: boolean;
  lastEvent: SSEEvent | null;
  error: string | null;
  reconnect: () => void;
};

export function useSSE(customerId?: string): UseSSEResult {
  const eventSourceRef = useRef<EventSource | null>(null);

  const dispatch = useAppDispatch();

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    await dispatch(fetchNotifications());
  }, [dispatch]);

  const connect = useCallback(() => {
    if (!customerId) {
      return;
    }

    eventSourceRef.current?.close();

    const eventSource = new EventSource(
      `${baseURL}/sse/stream?customer_id=${encodeURIComponent(customerId)}`,
      {
        withCredentials: true,
      }
    );

    eventSourceRef.current = eventSource;

    // --------------------------------
    // CONNECTION OPEN
    // --------------------------------
    eventSource.onopen = () => {
      console.log("🟢 SSE connected");

      setConnected(true);
      setError(null);
    };

    // --------------------------------
    // CONNECTED EVENT
    // --------------------------------
    eventSource.addEventListener("connected", (event) => {
      const messageEvent = event as MessageEvent<string>;

      console.log("🔌 SSE connected event:", messageEvent.data);
    });

    // --------------------------------
    // MESSAGE EVENT
    // --------------------------------
    eventSource.addEventListener("loan.created", async (event) => {
      try {
        const messageEvent = event as MessageEvent<string>;

        console.log("🔥 SSE message:", messageEvent.data);

        const data = JSON.parse(messageEvent.data);

        await loadNotifications();

        setLastEvent({
          type: "message",
          data,
        });
      } catch (error) {
        console.error("SSE message parse error:", error);

        setLastEvent({
          type: "message",
          data: event.data,
        });
      }
    });

    // --------------------------------
    // NOTIFICATION EVENT
    // --------------------------------
    eventSource.addEventListener("loan.status_changed", async (event) => {
      try {
        const messageEvent = event as MessageEvent<string>;

        console.log(
          "🔔 SSE notification:",
          messageEvent.data
        );

        const data = JSON.parse(messageEvent.data);

        await loadNotifications();

        setLastEvent({
          type: "notification",
          data,
        });
      } catch (error) {
        console.error("SSE notification parse error:", error);
      }
    });

    // --------------------------------
    // ERROR
    // --------------------------------
    eventSource.onerror = (event) => {
      console.error("🔴 SSE error:", event);

      setConnected(false);
      setError("SSE connection lost");
    };
  }, [customerId, loadNotifications]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!customerId) {
      setConnected(false);
      setError(null);
      return;
    }

    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [customerId, connect]);

  return {
    connected,
    lastEvent,
    error,
    reconnect,
  };
}