import { Wallet } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/format";

export function PortalAccountsPage() {
  const { data, status, error, refetch } = useFetch((signal) => portalApi.accounts(signal), []);

  if (status === "loading") return <TableSkeleton rows={4} />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <EmptyState icon={Wallet} title="No accounts yet" description="Your bank accounts will appear here." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ul>
        {data.map((account) => (
          <li key={account.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy-900">{account.account_type ?? "Account"}</p>
              <p className="font-mono-num text-xs text-slate-500">{String(account.account_number ?? "")}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={account.status === "ACTIVE" ? "positive" : "neutral"}>{String(account.status ?? "")}</Badge>
              <span className="font-mono-num text-sm font-semibold text-navy-900">
                {formatCurrency(Number(account.balance ?? 0), String(account.currency ?? "INR"))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
