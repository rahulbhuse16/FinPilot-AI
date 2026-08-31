import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { cn } from "../../utils/cn";
import { formatCurrency, formatDateTime } from "../../utils/format";

export function PortalTransactionsPage() {
  const { data, status, error, refetch } = useFetch((signal) => portalApi.transactions(50, signal), []);

  if (status === "loading") return <TableSkeleton rows={8} />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <EmptyState icon={Receipt} title="No transactions yet" description="Your activity will show up here." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-5 py-3">Date</th>
            <th scope="col" className="px-5 py-3">Merchant</th>
            <th scope="col" className="px-5 py-3">Category</th>
            <th scope="col" className="px-5 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction) => {
            const isCredit = String(transaction.transaction_type ?? "").toUpperCase() === "CREDIT";

            return (
              <tr key={transaction.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-3.5 text-slate-500">
                  {formatDateTime(transaction.transaction_time as string)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        isCredit ? "bg-positive-soft text-positive" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {isCredit ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </span>
                    <span className="font-medium text-navy-900">
                      {transaction.merchant ?? transaction.description ?? "Transaction"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{transaction.category ?? "—"}</td>
                <td
                  className={cn(
                    "px-5 py-3.5 text-right font-mono-num font-medium",
                    isCredit ? "text-positive" : "text-navy-900"
                  )}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(Math.abs(Number(transaction.amount ?? 0)))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
