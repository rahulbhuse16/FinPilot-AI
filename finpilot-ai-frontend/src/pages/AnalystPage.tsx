import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedCustomer } from "../store/customerSlice";
import { CustomerSelector } from "../components/customer/CustomerSelector";
import { AIMessage } from "../components/ai/AIMessage";
import { ChatInput } from "../components/ai/ChatInput";
import { useAnalystConversation } from "../hooks/useAnalystConversation";
import { Button } from "../components/ui/Button";

export function AnalystPage() {
  const selectedCustomer = useAppSelector((s) => s.customer.selectedCustomer);
  const dispatch = useAppDispatch();
  const { messages, send, isSending, reset } = useAnalystConversation(selectedCustomer?.id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <CustomerSelector
            value={selectedCustomer}
            onChange={(c) => {
              dispatch(setSelectedCustomer(c));
              reset();
            }}
            placeholder="Select a customer (optional)"
          />
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset}>
            New conversation
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent-teal-soft text-accent-teal">
                <Sparkles className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="font-display text-sm font-semibold text-navy-900">FinPilot AI Financial Analyst</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Ask about financial health, risk exposure, transaction anomalies, or your uploaded policy documents.
                Select a customer above to ground the analysis in their profile.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <AIMessage key={m.id} message={m} />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <ChatInput onSend={send} isLoading={isSending} />
      </div>
    </div>
  );
}
