import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUp } from "lucide-react";

const SUGGESTIONS = [
  "Analyze this customer's financial health",
  "What are the biggest financial risks?",
  "Review this customer's loan exposure",
  "Are there any unusual transactions?",
  "What does our uploaded policy say about eligibility?",
];

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled || isLoading) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => setValue(s)}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-accent-teal hover:text-accent-teal disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? "Select a customer to begin, or ask a general question" : "Ask about financial health, risk, transactions…"}
          aria-label="Ask the AI financial analyst"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-accent-teal disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={disabled || isLoading || !value.trim()}
          aria-label="Send question"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white transition-colors hover:bg-navy-800 disabled:bg-slate-300"
        >
          <ArrowUp className="h-[18px] w-[18px]" />
        </button>
      </form>
    </div>
  );
}
