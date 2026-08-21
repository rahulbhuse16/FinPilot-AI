import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";
import type { Transaction } from "../../types/domain";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
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
          {transactions.map((t) => {
            const isCredit = t.type === "credit";
            return (
              <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-3.5 text-slate-500">{formatDate(t.date)}</td>
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
                    <span className="font-medium text-navy-900">{t.merchant ?? t.description ?? "Transaction"}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{t.category ?? "—"}</td>
                <td
                  className={cn(
                    "px-5 py-3.5 text-right font-mono-num font-medium",
                    isCredit ? "text-positive" : "text-navy-900"
                  )}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(Math.abs(t.amount))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
