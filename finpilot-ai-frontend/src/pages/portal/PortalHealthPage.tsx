import { Sparkles } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { customerAiApi } from "../../api/customerAi.api";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { ScoreGauge } from "../../components/health/ScoreGauge";
import { InsightCard } from "../../components/health/InsightCard";
import { RecommendationCard } from "../../components/health/RecommendationCard";

const DIMENSION_TONE: Record<string, "positive" | "warning" | "risk" | "neutral"> = {
  GOOD: "positive",
  FAIR: "warning",
  POOR: "risk",
};

function askFinPilot() {
  // The floating FinPilot assistant (if mounted in the layout) can listen for
  // this event to open itself with context. Harmless no-op if nothing listens.
  window.dispatchEvent(new CustomEvent("finpilot:open-assistant"));
}

export function PortalHealthPage() {
  const { data: customer } = useFetch((signal) => portalApi.profile(signal), []);
  const customerId = customer?.id;

  const healthFetch = useFetch(
    (signal) => customerAiApi.getFinancialHealth(customerId!, signal),
    [customerId],
    !!customerId
  );
  const insightsFetch = useFetch(
    (signal) => customerAiApi.getFinancialInsights(customerId!, signal),
    [customerId],
    !!customerId
  );
  const recsFetch = useFetch(
    (signal) => customerAiApi.getFinancialRecommendations(customerId!, signal),
    [customerId],
    !!customerId
  );

  if (healthFetch.status === "loading" || !customerId) {
    return (
      <div className="space-y-5">
        <CardSkeleton rows={3} />
        <CardSkeleton rows={3} />
      </div>
    );
  }

  if (healthFetch.status === "error") {
    return <ErrorState message={healthFetch.error?.message} onRetry={healthFetch.refetch} />;
  }

  const health = healthFetch.data;
  if (!health) return <EmptyState title="No financial health data available yet" />;

  const dimensions = [
    { key: "spending", label: "Spending Health", dim: health.spending_health },
    { key: "cashflow", label: "Cash Flow", dim: health.cash_flow_health },
    { key: "loan", label: "Loan Health", dim: health.loan_health },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ScoreGauge score={health.score} previousScore={health.previous_score} />
          <button
            onClick={askFinPilot}
            className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800"
          >
            <Sparkles className="h-4 w-4" /> Ask FinPilot
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {dimensions.map(({ key, label, dim }) => (
            <div key={key} className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge tone={DIMENSION_TONE[dim.status] ?? "neutral"}>{dim.status}</Badge>
                {typeof dim.score === "number" && (
                  <span className="font-mono-num text-xs text-slate-400">{dim.score}/100</span>
                )}
              </div>
              {dim.description && <p className="mt-1.5 text-xs text-slate-500">{dim.description}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <p className="font-display text-sm font-semibold text-navy-900">AI Insights</p>
        </div>
        {insightsFetch.status === "loading" && <CardSkeleton rows={3} />}
        {insightsFetch.status === "error" && (
          <div className="p-5">
            <ErrorState message={insightsFetch.error?.message} onRetry={insightsFetch.refetch} />
          </div>
        )}
        {insightsFetch.status === "success" && (insightsFetch.data?.length ?? 0) === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">No insights available yet — check back after more activity.</p>
        )}
        {insightsFetch.status === "success" && (insightsFetch.data?.length ?? 0) > 0 && (
          <ul>
            {insightsFetch.data!.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <p className="font-display text-sm font-semibold text-navy-900">Recommended Actions</p>
        </div>
        {recsFetch.status === "loading" && <CardSkeleton rows={3} />}
        {recsFetch.status === "error" && (
          <div className="p-5">
            <ErrorState message={recsFetch.error?.message} onRetry={recsFetch.refetch} />
          </div>
        )}
        {recsFetch.status === "success" && (recsFetch.data?.length ?? 0) === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">No recommendations right now — you're on track.</p>
        )}
        {recsFetch.status === "success" && (recsFetch.data?.length ?? 0) > 0 && (
          <ul>
            {recsFetch.data!.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
