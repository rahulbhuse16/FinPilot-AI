import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { customersApi } from "../api/customers.api";
import { FinancialHealthGrid } from "../components/customer/FinancialHealthGrid";
import { CardSkeleton } from "../components/ui/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { initials, formatCurrency, formatDate } from "../utils/format";

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();

  const { data: profile, status, error, refetch } = useFetch(
    (signal) => customersApi.get360(customerId!, signal),
    [customerId],
    !!customerId
  );

  console.log("data",profile)

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      {status === "loading" && (
        <div className="space-y-4">
          <CardSkeleton rows={2} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} rows={2} />
            ))}
          </div>
        </div>
      )}

      {status === "error" && <ErrorState message={error?.message} onRetry={refetch} />}

      {status === "success" && profile && (
        <>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-lg font-semibold text-white">
              {initials(profile?.full_name)}
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-navy-900">{profile?.full_name}</h2>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                {profile?.email && <span>{profile?.email}</span>}
                {profile?.segment && <span>{profile?.segment}</span>}
                {profile?.created_at && <span>Customer since {formatDate(profile?.created_at)}</span>}
              </div>
            </div>
          </div>

          <FinancialHealthGrid profile={profile} />

          {profile?.accounts && profile.accounts?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                <Wallet className="h-4 w-4 text-slate-400" />
                <p className="font-display text-sm font-semibold text-navy-900">Accounts</p>
              </div>
              <ul>
                {profile.accounts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0">
                    <span className="text-sm text-navy-800">{a.account_type ?? "Account"}</span>
                    <span className="font-mono-num text-sm font-medium text-navy-900">{formatCurrency(a.balance)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
