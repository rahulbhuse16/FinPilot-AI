import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Receipt,
  FileStack,
  SearchCheck,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyst", label: "AI Analyst", icon: Sparkles },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/documents", label: "Documents", icon: FileStack },
  { to: "/investigation", label: "Investigation", icon: SearchCheck },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 transform bg-navy-900 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-teal text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-white">
              FinPilot <span className="text-accent-teal">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-3 flex flex-col gap-1 px-3" aria-label="Sections">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-navy-700 text-white"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.85} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-navy-800 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            FinPilot AI · Financial intelligence platform
          </p>
        </div>
      </aside>
    </>
  );
}
