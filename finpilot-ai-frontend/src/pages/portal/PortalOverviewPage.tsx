import { AlertTriangle, CreditCard, TrendingDown, Wallet } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { FinancialMetricCard } from "../../components/financial/FinancialMetricCard";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatCompactCurrency, formatDateTime, formatPercent } from "../../utils/format";

export function PortalOverviewPage() {
  const { data: summary, status, error, refetch } = useFetch((signal) => portalApi.summary(signal), []);
  const { data: anomalies } = useFetch((signal) => portalApi.anomalies(signal), []);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} rows={2} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  if (!summary) {
    return <EmptyState title="No account summary available" />;
  }

  const dti = Number(summary.debt_to_income_ratio ?? 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinancialMetricCard
          label="Total Balance"
          value={formatCompactCurrency(Number(summary.total_balance ?? 0))}
          sublabel={`${summary.account_count ?? 0} account(s)`}
          icon={Wallet}
        />
        <FinancialMetricCard
          label="Loan Outstanding"
          value={formatCompactCurrency(Number(summary.total_loan_outstanding ?? 0))}
          sublabel={`${summary.active_loan_count ?? 0} active loan(s)`}
          icon={TrendingDown}
          tone={Number(summary.total_loan_outstanding ?? 0) > 0 ? "warning" : "neutral"}
        />
        <FinancialMetricCard
          label="Monthly EMI"
          value={formatCompactCurrency(Number(summary.total_monthly_emi ?? 0))}
          sublabel="Across active loans"
          icon={CreditCard}
        />
        <FinancialMetricCard
          label="Debt-to-Income"
          value={formatPercent(dti)}
          sublabel="Share of monthly income"
          tone={dti <= 35 ? "positive" : dti <= 50 ? "warning" : "risk"}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
          <AlertTriangle className="h-4 w-4 text-slate-400" />
          <p className="font-display text-sm font-semibold text-navy-900">Unusual activity</p>
        </div>
        {anomalies && anomalies.length > 0 ? (
          <ul>
            {anomalies.map((anomaly) => (
              <li key={anomaly.transaction_id ?? anomaly.id} className="border-b border-slate-50 px-5 py-3.5 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-navy-900">{anomaly.merchant ?? "Transaction"}</span>
                  <span className="font-mono-num text-sm text-risk">
                    {formatCompactCurrency(Number(anomaly.amount ?? 0))}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {(anomaly.reasons as string[] | undefined)?.join(" · ") ?? anomaly.reason ?? "Flagged for review"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(anomaly.transaction_time as string)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-slate-500">No unusual activity detected on your account.</p>
        )}
      </div>
    </div>
  );
}
