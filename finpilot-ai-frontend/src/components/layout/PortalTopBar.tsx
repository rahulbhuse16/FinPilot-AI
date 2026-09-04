import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import NotificationBadge from "../notification/Badge";
import { useAppSelector } from "../../store/hooks";
import NotificationModal from "../notification/Modal";

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
}

export function PortalTopbar({
  onMenuClick,
  title,
}: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { unreadCount } = useAppSelector(
    (state) => state.notifications
  );

  const [showNotifications, setShowNotifications] =
    useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="font-display text-base font-semibold text-navy-900 sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="relative flex items-center gap-3">
        <NotificationBadge
          count={unreadCount}
          onClick={() =>
            setShowNotifications((prev) => !prev)
          }
        />

        {showNotifications && (
          <NotificationModal
            onClose={() => setShowNotifications(false)}
          />
        )}

        <span className="hidden text-sm text-slate-500 sm:inline">
          {user?.full_name}
        </span>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">
            Sign out
          </span>
        </button>
      </div>
    </header>
  );
}