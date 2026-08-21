import { Activity, ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";

type HealthStatus = "loading" | "success" | "error";

interface HealthData {
  status?: string;
  database?: string;
  version?: string;
}

interface DashboardHeaderProps {
  health?: HealthData | null;
  healthStatus: HealthStatus;
  dateLabel?: string;
}

export function DashboardHeader({
  health,
  healthStatus,
  dateLabel,
}: DashboardHeaderProps) {
  const isHealthy =
    healthStatus === "success" && health?.status === "healthy";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-50 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              FinPilot AI
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            Financial Intelligence Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor financial health, transaction risk and AI-driven insights
            from one workspace.
          </p>

          {dateLabel && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <CalendarDays className="h-4 w-4" />
              {dateLabel}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />

            {healthStatus === "loading" && (
              <Badge tone="neutral">Checking systems</Badge>
            )}

            {healthStatus === "error" && (
              <Badge tone="warning">Backend unreachable</Badge>
            )}

            {healthStatus === "success" && (
              <Badge tone={isHealthy ? "positive" : "warning"}>
                {isHealthy ? "Systems operational" : "Degraded"}
              </Badge>
            )}
          </div>

          <Link
            to="/analyst"
            className="group inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            <Sparkles className="h-4 w-4" />
            Ask FinPilot
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}