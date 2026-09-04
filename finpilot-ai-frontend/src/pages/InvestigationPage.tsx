import { useState } from "react";
import { SearchCheck, Wallet, Receipt, Landmark, ShieldAlert, Sparkles } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedCustomer } from "../store/customerSlice";
import { CustomerSelector } from "../components/customer/CustomerSelector";
import { useFetch } from "../hooks/useFetch";
import { customersApi } from "../api/customers.api";
import { transactionsApi } from "../api/transactions.api";
import { loansApi } from "../api/loans.api";
import { normalizeList } from "../utils/list";
import { FinancialHealthGrid } from "../components/customer/FinancialHealthGrid";
import { AnomalyCard } from "../components/transactions/AnomalyCard";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { AIMessage } from "../components/ai/AIMessage";
import { ChatInput } from "../components/ai/ChatInput";
import { useAnalystConversation } from "../hooks/useAnalystConversation";
import { CardSkeleton, TableSkeleton } from "../components/ui/LoadingSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { formatCompactCurrency } from "../utils/format";
import type { Transaction, Loan } from "../types/domain";

type Tab = "health" | "transactions" | "loans" | "anomalies" | "analysis";

const TABS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: "health", label: "Financial Health", icon: Wallet },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "loans", label: "Loans", icon: Landmark },
  { id: "anomalies", label: "Anomalies", icon: ShieldAlert },
  { id: "analysis", label: "AI Analysis", icon: Sparkles },
];

export function InvestigationPage() {
  const selectedCustomer = useAppSelector((s) => s.customer.selectedCustomer);
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>("health");
  const { messages, send, isSending } = useAnalystConversation(selectedCustomer?.id ?? null);

  const customerId = selectedCustomer?.id;

  const profileFetch = useFetch((signal) => customersApi.get360(customerId!, signal), [customerId], !!customerId && tab === "health");
  const txFetch = useFetch(
    (signal) => transactionsApi.list({ customerId, page_size: 20, signal }),
    [customerId],
    !!customerId && tab === "transactions"
  );
  const loanFetch = useFetch((signal) => loansApi.list({ customerId, signal }), [customerId], !!customerId && tab === "loans");
  const anomalyFetch = useFetch(
    (signal) => transactionsApi.getAnomalies(customerId!, signal),
    [customerId],
    !!customerId && tab === "anomalies"
  );

  const handleApprove=async(id:string)=>{

    await loansApi.handleLoanRequest(id,{loan_id:id,
      status:"ACTIVE"
    })

  }

  const handleReject=async(id:string)=>{
    await loansApi.handleLoanRequest(id,{loan_id:id,
      status:"REJECTED"
    })

  }

  if (!selectedCustomer) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <CustomerSelector
          value={selectedCustomer}
          onChange={(c) => dispatch(setSelectedCustomer(c))}
          placeholder="Select a customer to begin investigation"
        />
        <EmptyState
          icon={SearchCheck}
          title="Select a customer to begin"
          description="The investigation workspace pulls financial health, transactions, loans, and anomaly data together, then lets the AI analyst reason across all of it in one question."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <CustomerSelector value={selectedCustomer} onChange={(c) => dispatch(setSelectedCustomer(c))} />

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <t.icon className="h-4 w-4" strokeWidth={1.85} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "health" && (
        <>
          {profileFetch.status === "loading" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} rows={2} />
              ))}
            </div>
          )}
          {profileFetch.status === "error" && <ErrorState message={profileFetch.error?.message} onRetry={profileFetch.refetch} />}
          {profileFetch.status === "success" && profileFetch.data && <FinancialHealthGrid profile={profileFetch.data} />}
        </>
      )}

      {tab === "transactions" && (
        <>
          {txFetch.status === "loading" && <TableSkeleton rows={6} />}
          {txFetch.status === "error" && <ErrorState message={txFetch.error?.message} onRetry={txFetch.refetch} />}
          {txFetch.status === "success" && normalizeList<Transaction>(txFetch.data).length === 0 && (
            <EmptyState icon={Receipt} title="No transactions" description="This customer has no recorded transactions." />
          )}
          {txFetch.status === "success" && normalizeList<Transaction>(txFetch.data).length > 0 && (
            <TransactionTable transactions={normalizeList<Transaction>(txFetch.data)} />
          )}
        </>
      )}

      {tab === "loans" && (
        <>
          {loanFetch.status === "loading" && <TableSkeleton rows={4} />}
          {loanFetch.status === "error" && <ErrorState message={loanFetch.error?.message} onRetry={loanFetch.refetch} />}
          {loanFetch.status === "success" && normalizeList<Loan>(loanFetch.data).length === 0 && (
            <EmptyState icon={Landmark} title="No loans on record" description="This customer has no active or historical loans." />
          )}
          {loanFetch.status === "success" && normalizeList<Loan>(loanFetch.data).length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ul>
                {normalizeList<Loan>(loanFetch.data).map((l) => (
                  <li
  key={l.id}
  className="
    group relative overflow-hidden
    border-b border-slate-100/80
    px-5 py-4
    transition-all duration-200
    hover:bg-slate-50/70
    last:border-0
  "
>
  <div className="flex flex-wrap items-center justify-between gap-4">
    {/* Loan Info */}
    <div className="flex items-center gap-3">
      {/* Loan Icon */}
      <div
        className="
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-xl
          border border-slate-200
          bg-white
          shadow-sm
          text-slate-600
        "
      >
        <svg
          className="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 10v9h14v-9" />
          <path d="M9 19v-5h6v5" />
        </svg>
      </div>

      <div>
        <p className="text-sm font-semibold tracking-[-0.01em] text-slate-900">
          {l.loan_type ?? "Loan"}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          Interest rate{" "}
          <span className="font-medium text-slate-700">
            {l.interest_rate ?? "—"}%
          </span>
        </p>
      </div>
    </div>

    {/* Right Side */}
    <div className="flex flex-wrap items-center gap-3">
      {/* Amount */}
      <span className="font-mono-num text-sm font-semibold text-slate-900">
        {formatCompactCurrency(l.outstanding_balance)}
      </span>

      {/* View Salary Slip */}
      {l.salary_slip_url && (
        <button
          type="button"
          onClick={() => window.open(l.salary_slip_url, "_blank")}
          className="
            inline-flex items-center gap-1.5
            rounded-lg
            border border-slate-200
            bg-white
            px-3 py-1.5
            text-xs font-semibold
            text-slate-600
            shadow-sm
            transition-all duration-200
            hover:border-blue-300
            hover:bg-blue-50
            hover:text-blue-700
            active:scale-[0.97]
          "
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>

          View Document
        </button>
      )}

      {/* Status / Actions */}
      {l.status?.toUpperCase() === "ACTIVE" ? (
        <div
          className="
            inline-flex items-center gap-1.5
            rounded-full
            border border-emerald-200
            bg-emerald-50
            px-3 py-1.5
            text-xs font-semibold
            text-emerald-700
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Approved
        </div>
      ) : l.status?.toUpperCase() === "REJECTED" ? (
        <div
          className="
            inline-flex items-center gap-1.5
            rounded-full
            border border-red-200
            bg-red-50
            px-3 py-1.5
            text-xs font-semibold
            text-red-700
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Rejected
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {/* Approve */}
          <button
            type="button"
            onClick={() => handleApprove(l.id)}
            className="
              group/approve
              inline-flex items-center gap-1.5
              rounded-lg
              border border-slate-200
              bg-white
              px-3 py-1.5
              text-xs font-semibold
              text-slate-700
              shadow-sm
              transition-all duration-200
              hover:border-emerald-300
              hover:bg-emerald-50
              hover:text-emerald-700
              hover:shadow-emerald-100
              active:scale-[0.97]
            "
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
            Approve
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() => handleReject(l.id)}
            className="
              inline-flex items-center gap-1.5
              rounded-lg
              border border-slate-200
              bg-white
              px-3 py-1.5
              text-xs font-semibold
              text-slate-500
              shadow-sm
              transition-all duration-200
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              active:scale-[0.97]
            "
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            Reject
          </button>
        </div>
      )}
    </div>
  </div>
</li>
                  
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {tab === "anomalies" && (
        <>
          {anomalyFetch.status === "loading" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CardSkeleton rows={2} />
              <CardSkeleton rows={2} />
            </div>
          )}
          {anomalyFetch.status === "error" && <ErrorState message={anomalyFetch.error?.message} onRetry={anomalyFetch.refetch} />}
          {anomalyFetch.status === "success" && normalizeList(anomalyFetch.data).length === 0 && (
            <EmptyState title="No anomalies detected" description="Transaction activity for this customer looks normal." />
          )}
          {anomalyFetch.status === "success" && normalizeList(anomalyFetch.data).length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {normalizeList(anomalyFetch.data).map((a) => (
                <AnomalyCard key={a.id} anomaly={a} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "analysis" && (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white">
          <div className="flex-1 space-y-5 px-4 py-5 sm:px-6">
            {messages.length === 0 && (
              <EmptyState
                icon={Sparkles}
                title="Ask for a complete risk assessment"
                description={`One question orchestrates multiple backend tools — Customer 360, transaction analysis, and loan analysis — for ${selectedCustomer.full_name}.`}
              />
            )}
            {messages.map((m) => (
              <AIMessage key={m.id} message={m} />
            ))}
          </div>
          <ChatInput onSend={send} isLoading={isSending} />
        </div>
      )}
    </div>
  );
}
