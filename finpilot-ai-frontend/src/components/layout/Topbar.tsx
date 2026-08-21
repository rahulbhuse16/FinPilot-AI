import { Menu, Wifi, WifiOff } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { healthApi } from "../../api/health.api";
import { cn } from "../../utils/cn";

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { data, status } = useFetch((signal) => healthApi.check(signal), [], true);
  const healthy = status === "success" && data?.status === "healthy";

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
        <h1 className="font-display text-base font-semibold text-navy-900 sm:text-lg">{title}</h1>
      </div>

      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          status === "loading" && "bg-slate-100 text-slate-500",
          healthy && "bg-positive-soft text-positive",
          status === "error" && "bg-risk-soft text-risk",
          status === "success" && !healthy && "bg-warning-soft text-warning"
        )}
        title="Backend connection status"
      >
        {healthy ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">
          {status === "loading" ? "Checking…" : healthy ? "Systems normal" : "Backend unavailable"}
        </span>
      </div>
    </header>
  );
}
