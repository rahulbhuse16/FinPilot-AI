import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, User } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { customersApi } from "../../api/customers.api";
import { normalizeList } from "../../utils/list";
import { initials } from "../../utils/format";
import { cn } from "../../utils/cn";
import type { Customer } from "../../types/domain";

interface CustomerSelectorProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  placeholder?: string;
}

export function CustomerSelector({ value, onChange, placeholder = "Select a customer" }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, status } = useFetch(
    (signal) => customersApi.list({ search: debouncedQuery, page_size: 8, signal }),
    [debouncedQuery],
    open
  );
  const customers = normalizeList<Customer>(data);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm hover:border-slate-300"
      >
        {value ? (
          <>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[11px] font-semibold text-white">
              {initials(value.full_name)}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-navy-900">{value.full_name}</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-slate-400" />
            <span className="flex-1 text-slate-500">{placeholder}</span>
          </>
        )}
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers…"
              aria-label="Search customers"
              className="w-full text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1" role="listbox">
            {status === "loading" && (
              <p className="px-3 py-3 text-sm text-slate-400">Searching…</p>
            )}
            {status === "error" && <p className="px-3 py-3 text-sm text-risk">Couldn't load customers.</p>}
            {status === "success" && customers.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-400">No customers found.</p>
            )}
            {customers.map((c) => (
              <button
                key={c.id}
                role="option"
                aria-selected={value?.id === c.id}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-navy-700">
                  {initials(c.full_name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-navy-900">{c.full_name}</span>
                  {c.email && <span className="block truncate text-xs text-slate-500">{c.email}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
