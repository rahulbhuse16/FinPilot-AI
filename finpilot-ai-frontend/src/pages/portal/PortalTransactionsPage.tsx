import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Home,
  Plane,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../utils/cn";
import { formatCurrency, formatDateTime } from "../../utils/format";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  SALARY: Wallet,
  RENT: Home,
  GROCERY: ShoppingCart,
  TRAVEL: Plane,
  TRANSFER: ArrowRightLeft,
};

type FilterKey = "all" | "credit" | "debit";

export function PortalTransactionsPage() {
  const { data, status, error, refetch } = useFetch((signal) => portalApi.transactions(50, signal), []);
  const { data: anomalies } = useFetch((signal) => portalApi.anomalies(signal), []);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const anomalyIds = useMemo(
    () => new Set((anomalies ?? []).map((a) => a.transaction_id ?? a.id)),
    [anomalies]
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.filter((t) => {
      const isCredit = String(t.transaction_type ?? "").toUpperCase() === "CREDIT";
      if (filter === "credit" && !isCredit) return false;
      if (filter === "debit" && isCredit) return false;
      if (!q) return true;
      const merchant = String(t.merchant ?? t.description ?? "").toLowerCase();
      const category = String(t.category ?? "").toLowerCase();
      return merchant.includes(q) || category.includes(q);
    });
  }, [data, query, filter]);

  if (status === "loading") return <TableSkeleton rows={8} />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!data || data.length === 0) {
  //  return <EmptyState icon={Receipt} title="No transactions yet" description="Your activity will show up here." />;
  }

  return (
    <div className="space-y-3.5">
      
          <a
            href="/portal/create"
            type="button"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
              <Plus
                className="h-4 w-4"
                strokeWidth={2.2}
              />
            </span>

            Create Transaction

           
          </a>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-xs">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchant or category…"
            aria-label="Search transactions"
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(["all", "credit", "debit"] as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === key ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matching transactions" description="Try a different search or filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3">Date</th>
                <th scope="col" className="px-5 py-3">Merchant</th>
                <th scope="col" className="px-5 py-3">Category</th>
                <th scope="col" className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((transaction, i) => {
                const isCredit = String(transaction.transaction_type ?? "").toUpperCase() === "CREDIT";
                const isFlagged = anomalyIds.has(transaction.id);
                const CategoryIcon = CATEGORY_ICON[String(transaction.category ?? "").toUpperCase()] ?? Receipt;

                return (
                  <tr
                    key={transaction.id}
                    className={cn(
                      "animate-fade-in border-b border-slate-50 last:border-0 hover:bg-slate-50/60",
                      isFlagged && "bg-risk-soft/40"
                    )}
                    style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
                  >
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
                          {isCredit ? (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="font-medium text-navy-900">
                          {transaction.merchant ?? transaction.description ?? "Transaction"}
                        </span>
                        {isFlagged && (
                          <span title="Flagged as unusual activity">
                            <AlertTriangle className="h-3.5 w-3.5 text-risk" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CategoryIcon className="h-3.5 w-3.5 text-slate-400" />
                        {transaction.category ?? "—"}
                      </span>
                    </td>
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
      )}
    </div>
  );
}