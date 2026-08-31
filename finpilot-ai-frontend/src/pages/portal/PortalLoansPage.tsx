import { CreditCard } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatPercent } from "../../utils/format";

export function PortalLoansPage() {
  const { data, status, error, refetch } = useFetch((signal) => portalApi.loans(signal), []);

  if (status === "loading") return <CardSkeleton rows={4} />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <EmptyState icon={CreditCard} title="No loans" description="You have no loans with us right now." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {data.map((loan) => (
        <div key={loan.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-navy-900">{loan.loan_type ?? "Loan"}</p>
            <Badge tone={loan.status === "ACTIVE" ? "warning" : "neutral"}>{String(loan.status ?? "")}</Badge>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Outstanding</dt>
              <dd className="font-mono-num font-medium text-navy-900">
                {formatCurrency(Number(loan.outstanding_amount ?? 0))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Principal</dt>
              <dd className="font-mono-num text-navy-800">{formatCurrency(Number(loan.principal_amount ?? 0))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Monthly EMI</dt>
              <dd className="font-mono-num text-navy-800">{formatCurrency(Number(loan.monthly_emi ?? 0))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Interest rate</dt>
              <dd className="font-mono-num text-navy-800">{formatPercent(Number(loan.interest_rate ?? 0), 2)}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
