import { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { useDebounce } from "../hooks/useDebounce";
import { adminRiskApi } from "../api/adminRisk.api";
import { TableSkeleton, CardSkeleton } from "../components/ui/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { RiskTierBadge } from "../components/risk/RiskTierBadge";
import { ConfidenceMeter } from "../components/risk/ConfidenceMeter";
import { formatCompactCurrency, formatDateTime } from "../utils/format";
import type { RiskTier } from "../types/risk";

const TIER_FILTERS: { key: RiskTier | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "CRITICAL", label: "Critical" },
  { key: "HIGH", label: "High" },
  { key: "MEDIUM", label: "Medium" },
  { key: "LOW", label: "Low" },
];

function OverviewCard({
  label,
  count,
  tone,
  icon: Icon,
}: {
  label: string;
  count: number;
  tone: "risk" | "warning" | "positive" | "neutral";
  icon: typeof ShieldAlert;
}) {
  const toneClasses: Record<string, string> = {
    risk: "bg-risk-soft text-risk",
    warning: "bg-warning-soft text-warning",
    positive: "bg-positive-soft text-positive",
    neutral: "bg-slate-100 text-slate-500",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.85} />
        </span>
      </div>
      <p className="font-mono-num font-display mt-2 text-2xl font-semibold text-navy-900">{count}</p>
    </div>
  );
}

export function RiskRadarPage() {
  const [tier, setTier] = useState<RiskTier | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const overviewFetch = useFetch((signal) => adminRiskApi.getRiskOverview(signal), []);
  const listFetch = useFetch(
    (signal) => adminRiskApi.getRiskCustomers({ tier, search: debouncedQuery, page_size: 50 }, signal),
    [tier, debouncedQuery]
  );
  const investigationFetch = useFetch(
    (signal) => adminRiskApi.getCustomerRiskInvestigation(selectedCustomerId!, signal),
    [selectedCustomerId],
    !!selectedCustomerId
  );

  const customers = listFetch.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
          <Radar className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-navy-900">AI Risk & Anomaly Radar</h2>
          <p className="text-sm text-slate-500">Customers ranked by AI-detected repayment and spending risk.</p>
        </div>
      </div>

      {overviewFetch.status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} rows={1} />
          ))}
        </div>
      )}
      {overviewFetch.status === "error" && (
        <ErrorState message={overviewFetch.error?.message} onRetry={overviewFetch.refetch} />
      )}
      {overviewFetch.status === "success" && overviewFetch.data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard label="Critical" count={overviewFetch.data.critical_count} tone="risk" icon={AlertOctagon} />
          <OverviewCard label="High" count={overviewFetch.data.high_count} tone="risk" icon={AlertTriangle} />
          <OverviewCard label="Medium" count={overviewFetch.data.medium_count} tone="warning" icon={ShieldAlert} />
          <OverviewCard label="Low" count={overviewFetch.data.low_count} tone="positive" icon={ShieldCheck} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-xs">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
            aria-label="Search flagged customers"
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
          {TIER_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTier(f.key)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tier === f.key ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {listFetch.status === "loading" && <TableSkeleton rows={6} />}
      {listFetch.status === "error" && <ErrorState message={listFetch.error?.message} onRetry={listFetch.refetch} />}
      {listFetch.status === "success" && customers.length === 0 && (
        <EmptyState icon={ShieldCheck} title="No flagged customers" description="No customers match this filter." />
      )}
      {listFetch.status === "success" && customers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Signal</th>
                <th className="px-5 py-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.customer_id}
                  onClick={() => setSelectedCustomerId(c.customer_id)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5 font-medium text-navy-900">{c.customer_name}</td>
                  <td className="px-5 py-3.5">
                    <RiskTierBadge tier={c.risk_tier} />
                  </td>
                  <td className="px-5 py-3.5 font-mono-num text-navy-900">{c.risk_score}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.primary_signal}</td>
                  <td className="px-5 py-3.5">
                    <ConfidenceMeter confidence={c.confidence} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Investigation slide-over */}
      {selectedCustomerId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy-950/40"
            onClick={() => setSelectedCustomerId(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-teal" />
                <p className="font-display text-sm font-semibold text-navy-900">AI Risk Investigation</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                aria-label="Close investigation"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {investigationFetch.status === "loading" && <div className="p-5"><CardSkeleton rows={5} /></div>}
            {investigationFetch.status === "error" && (
              <div className="p-5">
                <ErrorState message={investigationFetch.error?.message} onRetry={investigationFetch.refetch} />
              </div>
            )}
            {investigationFetch.status === "success" && investigationFetch.data && (
              <div className="space-y-5 p-5">
                <div>
                  <p className="font-display text-base font-semibold text-navy-900">
                    {investigationFetch.data.customer_name}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <RiskTierBadge tier={investigationFetch.data.risk_tier} />
                    <span className="font-mono-num text-sm text-slate-600">
                      Score {investigationFetch.data.risk_score}
                    </span>
                    <ConfidenceMeter confidence={investigationFetch.data.confidence} />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Why this customer was flagged
                  </p>
                  <ul className="space-y-2">
                    {investigationFetch.data.signals.map((signal) => (
                      <li key={signal.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm font-medium text-navy-900">{signal.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{signal.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-accent-teal-soft p-3.5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-teal">
                    <Sparkles className="h-3.5 w-3.5" /> AI assessment
                  </p>
                  <p className="text-sm leading-relaxed text-navy-800">{investigationFetch.data.ai_assessment}</p>
                </div>

                {investigationFetch.data.repayment_behavior_summary && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Loan repayment behavior
                    </p>
                    <p className="text-sm text-slate-600">{investigationFetch.data.repayment_behavior_summary}</p>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Evidence</p>
                  {investigationFetch.data.evidence_transactions.length === 0 ? (
                    <p className="text-sm text-slate-500">No supporting transactions returned.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                      {investigationFetch.data.evidence_transactions.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-sm text-navy-900">{t.merchant ?? "Transaction"}</p>
                            <p className="text-xs text-slate-400">{formatDateTime(t.transaction_time)}</p>
                          </div>
                          <span className="font-mono-num shrink-0 text-sm font-medium text-risk">
                            {formatCompactCurrency(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
