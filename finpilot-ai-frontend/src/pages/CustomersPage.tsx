import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Users } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { useDebounce } from "../hooks/useDebounce";
import { customersApi } from "../api/customers.api";
import { normalizeList } from "../utils/list";
import { initials } from "../utils/format";
import { TableSkeleton } from "../components/ui/LoadingSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import type { Customer } from "../types/domain";

export function CustomersPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const navigate = useNavigate();

  const { data, status, error, refetch } = useFetch(
    (signal) => customersApi.list({ search: debouncedQuery, page_size: 50, signal }),
    [debouncedQuery]
  );
  const customers = normalizeList<Customer>(data);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 sm:max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search customers"
          className="w-full text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {status === "loading" && <TableSkeleton rows={8} />}
      {status === "error" && <ErrorState message={error?.message} onRetry={refetch} />}
      {status === "success" && customers.length === 0 && (
        <EmptyState
          icon={Users}
          title="No customers found"
          description={query ? "Try a different search term." : "No customer records are available yet."}
        />
      )}
      {status === "success" && customers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul>
            {customers.map((c) => (
              <li key={c.id} className="border-b border-slate-100 last:border-0">
                <button
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
                    {initials(c.full_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-900">{c.full_name}</p>
                    {c.email && <p className="truncate text-xs text-slate-500">{c.email}</p>}
                  </div>
                  {c.risk_rating && (
                    <Badge tone={c.risk_rating.toLowerCase() === "high" ? "risk" : c.risk_rating.toLowerCase() === "medium" ? "warning" : "positive"}>
                      {c.risk_rating}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
