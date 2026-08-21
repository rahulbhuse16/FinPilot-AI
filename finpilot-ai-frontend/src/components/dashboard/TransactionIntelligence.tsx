import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleAlert,
  Receipt,
} from "lucide-react";

export type TransactionType = "credit" | "debit";

export interface DashboardTransaction {
  id: string;
  merchant: string;
  category?: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  isAnomaly?: boolean;
}

interface TransactionIntelligenceProps {
  transactions: DashboardTransaction[];
  loading?: boolean;
  currencyFormatter?: (value: number) => string;
}

export function TransactionIntelligence({
  transactions,
  loading = false,
  currencyFormatter = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value),
}: TransactionIntelligenceProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-slate-400" />
            <h2 className="font-display text-base font-semibold text-navy-900">
              Transaction Intelligence
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Recent financial activity and transaction signals.
          </p>
        </div>

        <div className="flex gap-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <span>CREDIT</span>
          <span>DEBIT</span>
          <span>ANOMALY</span>
        </div>
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : transactions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-navy-900">
            No transaction activity yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Transaction insights will appear when financial activity is
            available.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              currencyFormatter={currencyFormatter}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TransactionRow({
  transaction,
  currencyFormatter,
}: {
  transaction: DashboardTransaction;
  currencyFormatter: (value: number) => string;
}) {
  const isCredit = transaction.type === "credit";

  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50 ${
        transaction.isAnomaly ? "bg-amber-50/40" : ""
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isCredit
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {isCredit ? (
          <ArrowDownLeft className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-navy-900">
            {transaction.merchant}
          </p>

          {transaction.isAnomaly && (
            <CircleAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {transaction.category || "Uncategorized"} ·{" "}
          {new Date(transaction.date).toLocaleDateString("en-IN")}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-sm font-bold ${
            isCredit ? "text-emerald-700" : "text-navy-900"
          }`}
        >
          {isCredit ? "+" : "-"}
          {currencyFormatter(Math.abs(transaction.amount))}
        </p>

        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {transaction.isAnomaly ? "Anomaly" : transaction.type}
        </p>
      </div>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex gap-4 px-6 py-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}