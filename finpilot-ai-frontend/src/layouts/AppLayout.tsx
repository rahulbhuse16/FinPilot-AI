import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analyst": "AI Financial Analyst",
  "/customers": "Customers",
  "/transactions": "Transaction Intelligence",
  "/documents": "Document Center",
  "/investigation": "Investigation Workspace",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/customers/")) return "Customer 360";
  return "FinPilot AI";
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={resolveTitle(pathname)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
