import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CreditCard, LayoutDashboard, LogOut, Receipt, Sparkles, UserRound, Wallet } from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/portal/accounts", label: "Accounts", icon: Wallet, end: false },
  { to: "/portal/transactions", label: "Transactions", icon: Receipt, end: false },
  { to: "/portal/loans", label: "Loans", icon: CreditCard, end: false },
  { to: "/portal/profile", label: "Profile", icon: UserRound, end: false },
];

const TITLES: Record<string, string> = {
  "/portal": "Overview",
  "/portal/accounts": "My Accounts",
  "/portal/transactions": "My Transactions",
  "/portal/loans": "My Loans",
  "/portal/profile": "My Profile",
};

export function PortalLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-navy-900">
              FinPilot <span className="text-accent-teal">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 sm:px-4" aria-label="Portal sections">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap",
                  isActive
                    ? "border-navy-900 text-navy-900"
                    : "border-transparent text-slate-500 hover:text-navy-900"
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.85} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <h1 className="mb-4 font-display text-lg font-semibold text-navy-900">
          {TITLES[pathname] ?? "Customer Portal"}
        </h1>
        <Outlet />
      </main>
    </div>
  );
}
