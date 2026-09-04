import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Bot, Loader2, Sparkles } from "lucide-react";
import { adminRiskApi } from "../api/adminRisk.api";
import { toApiError } from "../api/axios";
import { EmptyState } from "../components/ui/EmptyState";
import type { AdminCopilotResponse } from "../types/risk";

const SUGGESTIONS = [
  "Which customers had the biggest increase in spending this month?",
  "Show customers whose loan repayment behavior deteriorated.",
  "Which customers have unusual transaction activity?",
  "Summarize this month's financial risk.",
];

interface QueryEntry {
  id: string;
  question: string;
  status: "pending" | "complete" | "error";
  response?: AdminCopilotResponse;
  errorMessage?: string;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AdminCopilotPage() {
  const [question, setQuestion] = useState("");
  const [entries, setEntries] = useState<QueryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function runQuery(q: string) {
    const trimmed = q.trim();
    if (!trimmed || submitting) return;
    const id = makeId();
    setEntries((prev) => [{ id, question: trimmed, status: "pending" }, ...prev]);
    setSubmitting(true);
    setQuestion("");

    try {
      const response = await adminRiskApi.askAdminCopilot({ question: trimmed });
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "complete", response } : e)));
    } catch (err) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "error", errorMessage: toApiError(err).message } : e))
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runQuery(question);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
          <Bot className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-navy-900">Ask FinPilot Admin</h2>
          <p className="text-sm text-slate-500">
            Natural-language questions over your customer, transaction and loan data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={submitting}
              onClick={() => setQuestion(s)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-accent-teal hover:text-accent-teal disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                runQuery(question);
              }
            }}
            rows={1}
            placeholder="Ask a question about customers, transactions or risk…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-accent-teal"
          />
          <button
            type="submit"
            disabled={submitting || !question.trim()}
            aria-label="Ask AI"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white transition-colors hover:bg-navy-800 disabled:bg-slate-300"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </form>

      {entries.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Ask FinPilot Admin a question"
          description="Answers are grounded in your live customer, transaction and loan data — the model never runs raw SQL."
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <p className="text-sm font-medium text-navy-900">{entry.question}</p>
              </div>

              {entry.status === "pending" && (
                <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </div>
              )}

              {entry.status === "error" && (
                <p className="px-5 py-4 text-sm text-risk">{entry.errorMessage}</p>
              )}

              {entry.status === "complete" && entry.response && (
                <div className="space-y-4 px-5 py-4">
                  <p className="text-sm leading-relaxed text-navy-800">{entry.response.summary}</p>

                  {entry.response.metrics && entry.response.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.response.metrics.map((m, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] text-slate-500">{m.label}</p>
                          <p className="font-mono-num text-sm font-semibold text-navy-900">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.response.table && entry.response.table.rows.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                            {entry.response.table.columns.map((col) => (
                              <th key={col} className="px-3.5 py-2">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entry.response.table.rows.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0">
                              {row.map((cell, j) => (
                                <td key={j} className="px-3.5 py-2 text-navy-800">
                                  {cell ?? "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="rounded-lg bg-accent-teal-soft p-3.5">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-teal">
                      <Sparkles className="h-3.5 w-3.5" /> AI explanation
                    </p>
                    <p className="text-sm leading-relaxed text-navy-800">{entry.response.ai_explanation}</p>
                  </div>

                  {entry.response.related_customer_ids && entry.response.related_customer_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.response.related_customer_ids.map((id) => (
                        <Link
                          key={id}
                          to={`/customers/${id}`}
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-navy-800 hover:border-navy-300 hover:bg-slate-50"
                        >
                          View customer →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
