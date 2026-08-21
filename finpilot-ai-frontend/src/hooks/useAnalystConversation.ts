import { useCallback, useRef, useState } from "react";
import { conversationsApi } from "../api/conversations.api";
import { analystApi } from "../api/analyst.api";
import { toApiError } from "../api/axios";
import type { Message } from "../types/domain";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useAnalystConversation(customerId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const conversationIdRef = useRef<string | null>(null);

  const ensureConversation = useCallback(async () => {
    if (conversationIdRef.current) return conversationIdRef.current;
    const conversation = await conversationsApi.create(customerId, null);
    conversationIdRef.current = conversation.id;
    return conversation.id;
  }, [customerId]);

  const send = useCallback(
    async (question: string) => {
      const userMessage: Message = {
        id: makeId(),
        role: "user",
        content: question,
        created_at: new Date().toISOString(),
        status: "complete",
      };
      const pendingId = makeId();
      const pendingMessage: Message = {
        id: pendingId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        status: "pending",
      };
      setMessages((prev) => [...prev, userMessage, pendingMessage]);
      setIsSending(true);

      try {
        const conversationId = await ensureConversation();
        const response = await analystApi.ask({
          conversation_id: conversationId,
          customer_id: customerId,
          question,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  ...m,
                  content: response.answer,
                  sources: response.sources,
                  tools_used: response.tools_used,
                  status: "complete",
                }
              : m
          )
        );
      } catch (err) {
        const { message } = toApiError(err);
        setMessages((prev) =>
          prev.map((m) => (m.id === pendingId ? { ...m, content: message, status: "error" } : m))
        );
      } finally {
        setIsSending(false);
      }
    },
    [customerId, ensureConversation]
  );

  const reset = useCallback(() => {
    conversationIdRef.current = null;
    setMessages([]);
  }, []);

  return { messages, send, isSending, reset };
}
