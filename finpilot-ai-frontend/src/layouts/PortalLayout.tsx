import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PortalSidebar } from "../components/layout/PortalSideBar";
import { PortalTopbar } from "../components/layout/PortalTopBar";
import { AIAssistant } from "../components/ai/Assistant";

const TITLES: Record<string, string> = {
  "/portal": "Overview",
  "/portal/accounts": "My Accounts",
  "/portal/transactions": "My Transactions",
  "/portal/loans": "My Loans",
  "/portal/profile": "My Profile",
};

function resolveTitle(pathname: string): string {
  return TITLES[pathname] ?? "Customer Portal";
}

export function PortalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopbar
          onMenuClick={() => setMobileOpen(true)}
          title={resolveTitle(pathname)}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant */}
      <AIAssistant />
    </div>
  );
}