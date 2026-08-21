import { Receipt, ShieldAlert } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedCustomer } from "../store/customerSlice";
import { CustomerSelector } from "../components/customer/CustomerSelector";
import { useFetch } from "../hooks/useFetch";
import { transactionsApi } from "../api/transactions.api";
import { normalizeList } from "../utils/list";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { AnomalyCard } from "../components/transactions/AnomalyCard";
import { TableSkeleton, CardSkeleton } from "../components/ui/LoadingSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import type { Transaction } from "../types/domain";

export function TransactionsPage() {
  const selectedCustomer = useAppSelector((s) => s.customer.selectedCustomer);
  const dispatch = useAppDispatch();

  const {
    data: txData,
    status: txStatus,
    error: txError,
    refetch: refetchTx,
  } = useFetch(
    (signal) => transactionsApi.list({ customerId: selectedCustomer?.id, page_size: 30, signal }),
    [selectedCustomer?.id]
  );
  const transactions = normalizeList<Transaction>(txData);

  const {
    data: anomalies,
    status: anomalyStatus,
    error: anomalyError,
    refetch: refetchAnomalies,
  } = useFetch(
    (signal) => transactionsApi.getAnomalies(selectedCustomer!.id, signal),
    [selectedCustomer?.id],
    !!selectedCustomer
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <CustomerSelector
        value={selectedCustomer}
        onChange={(c) => dispatch(setSelectedCustomer(c))}
        placeholder="Select a customer to view transactions"
      />

      {selectedCustomer && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <p className="font-display text-sm font-semibold text-navy-900">Anomaly detection</p>
          </div>
          {anomalyStatus === "loading" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CardSkeleton rows={2} />
              <CardSkeleton rows={2} />
            </div>
          )}
          {anomalyStatus === "error" && <ErrorState message={anomalyError?.message} onRetry={refetchAnomalies} />}
          {anomalyStatus === "success" && normalizeList(anomalies).length === 0 && (
            <EmptyState title="No anomalies detected" description="Transaction activity for this customer looks normal." />
          )}
          {anomalyStatus === "success" && normalizeList(anomalies).length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {normalizeList(anomalies).map((a) => (
                <AnomalyCard key={a.id} anomaly={a} />
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-400" />
          <p className="font-display text-sm font-semibold text-navy-900">
            {selectedCustomer ? `Transactions · ${selectedCustomer.full_name}` : "Recent transactions"}
          </p>
        </div>
        {
          !selectedCustomer && (
            <EmptyState
            icon={Receipt}
            title="No customer selected"
            description={"Select a customer to see their transactions."}
          />
          )
        }
        {txStatus === "loading" && <TableSkeleton rows={8} />}
        {(txStatus === "error" && selectedCustomer) && <ErrorState message={txError?.message} onRetry={refetchTx} />}
        {txStatus === "success" && transactions.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description={selectedCustomer ? "This customer has no recorded transactions." : "Select a customer to see their activity."}
          />
        )}
        {txStatus === "success" && transactions.length > 0 && <TransactionTable transactions={transactions} />}
      </div>
    </div>
  );
}
