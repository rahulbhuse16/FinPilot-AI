import { useState } from "react";
import { Bot, X, Send, Sparkles, BotMessageSquare } from "lucide-react";
import { api } from "../../api/axios";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm FinPilot AI. I can help you understand your accounts, transactions, loans, and financial activity.",
    },
  ]);

  const sendMessage = async () => {
    const value = input.trim();

    if (!value) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      content: value,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await api.post("/assistant/chat", {
        question: value,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant" as const,
        content: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Assistant API error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant" as const,
          content:
            "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    }
  };


  return (
    <>
      {/* Floating AI Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6 z-50
            flex h-14 w-14 items-center justify-center
            rounded-full
            bg-gradient-to-br from-navy-600 via-navy-600 to-navy-700
            text-white
            shadow-[0_10px_35px_rgba(79,70,229,0.4)]
            transition-all duration-300
            hover:scale-110
            hover:shadow-[0_15px_45px_rgba(79,70,229,0.5)]
            active:scale-95
          "
          aria-label="Open FinPilot AI"
        >
          <Bot className="h-6 w-6" />

          {/* Notification dot */}
          <span
            className="
              absolute right-0 top-0
              h-3.5 w-3.5
              rounded-full
              border-2 border-white
              bg-emerald-400
            "
          />
        </button>
      )}

      {/* AI Chat Window */}
      {open && (
        <div
          className="
            fixed bottom-6 right-6 z-50
            flex h-[600px] w-[380px]
            max-w-[calc(100vw-32px)]
            flex-col overflow-hidden
            rounded-3xl
            border border-slate-200
            bg-white
            shadow-[0_25px_80px_rgba(15,23,42,0.22)]
          "
        >
          {/* Header */}
          <div
            className="
              relative overflow-hidden
              bg-gradient-to-br from-navy-600 via-navy-600 to-navy-700
              px-5 py-4 text-white
            "
          >
            {/* Decorative glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-2xl bg-white/15
                    ring-1 ring-white/20
                  "
                >
                  <BotMessageSquare className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">FinPilot AI</h3>

                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
                      AI
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-indigo-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Financial assistant
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="
                  rounded-xl p-2
                  text-white/80
                  transition hover:bg-white/10 hover:text-white
                "
                aria-label="Close AI assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                  }`}
              >
                {message.role === "assistant" && (
                  <div
                    className="
                      mr-2 flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-indigo-100 text-navy-600
                    "
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`
                    max-w-[78%]
                    rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${message.role === "user"
                      ? "rounded-br-md bg-navy-600 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }
                  `}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="border-t border-slate-100 bg-white px-4 pt-3">
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {[
                "Analyze my spending",
                "My loan status",
                "Recent transactions",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="
                    shrink-0 rounded-full
                    border border-slate-200
                    bg-slate-50 px-3 py-1.5
                    text-xs text-slate-600
                    transition
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    hover:text-indigo-600
                  "
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask FinPilot AI..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  px-3 py-2
                  text-sm text-slate-700
                  outline-none
                  placeholder:text-slate-400
                "
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-navy-600 text-white
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}