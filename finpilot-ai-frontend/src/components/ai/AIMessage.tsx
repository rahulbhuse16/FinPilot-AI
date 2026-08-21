import ReactMarkdown from "react-markdown";
import { Sparkles, User, AlertCircle } from "lucide-react";
import { ToolBadge } from "./ToolBadge";
import { SourceCitation } from "./SourceCitation";
import type { Message } from "../../types/domain";

export function AIMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex animate-fade-in items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy-900 px-4 py-3 text-sm text-white sm:max-w-[70%]">
          {message.content}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
          <User className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-teal text-white">
        <Sparkles className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 max-w-[92%] flex-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3.5 sm:max-w-[80%]">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-accent-teal">FinPilot AI</p>

        {message.status === "pending" ? (
          <div className="flex items-center gap-2 py-1 text-sm text-slate-500">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
            </span>
            Analyzing…
          </div>
        ) : message.status === "error" ? (
          <div className="flex items-start gap-2 text-sm text-risk">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message.content}</span>
          </div>
        ) : (
          <>
            <div className="prose-fin text-sm leading-relaxed text-navy-800">
              <ReactMarkdown
                components={{
                  h1: (p) => <p className="mb-2 font-display text-base font-semibold text-navy-900" {...p} />,
                  h2: (p) => <p className="mb-2 mt-3 font-display text-[15px] font-semibold text-navy-900" {...p} />,
                  h3: (p) => <p className="mb-1.5 mt-2.5 font-display text-sm font-semibold text-navy-900" {...p} />,
                  p: (p) => <p className="mb-2.5 last:mb-0" {...p} />,
                  ul: (p) => <ul className="mb-2.5 ml-4 list-disc space-y-1" {...p} />,
                  ol: (p) => <ol className="mb-2.5 ml-4 list-decimal space-y-1" {...p} />,
                  strong: (p) => <strong className="font-semibold text-navy-900" {...p} />,
                  code: (p) => <code className="rounded bg-slate-100 px-1 py-0.5 font-mono-num text-[13px]" {...p} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {(message.tools_used?.length ?? 0) > 0 && (
              <div className="mt-3.5 border-t border-slate-100 pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tools used</p>
                <div className="flex flex-wrap gap-1.5">
                  {message.tools_used!.map((t, i) => (
                    <ToolBadge key={`${t}-${i}`} tool={t} />
                  ))}
                </div>
              </div>
            )}

            {(message.sources?.length ?? 0) > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sources</p>
                <div className="flex flex-col gap-1.5">
                  {message.sources!.map((s, i) => (
                    <SourceCitation key={i} source={s} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
