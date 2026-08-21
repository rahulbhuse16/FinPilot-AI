import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  HeartPulse,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export type InsightSeverity = "positive" | "warning" | "danger" | "neutral";

export interface AIInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  actionLabel?: string;
  actionTo?: string;
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  loading?: boolean;
}

const severityConfig: Record<
  InsightSeverity,
  {
    icon: LucideIcon;
    iconClass: string;
    badgeClass: string;
  }
> = {
  positive: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600 bg-emerald-50",
    badgeClass: "text-emerald-700 bg-emerald-50",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600 bg-amber-50",
    badgeClass: "text-amber-700 bg-amber-50",
  },
  danger: {
    icon: ShieldAlert,
    iconClass: "text-red-600 bg-red-50",
    badgeClass: "text-red-700 bg-red-50",
  },
  neutral: {
    icon: Sparkles,
    iconClass: "text-slate-600 bg-slate-100",
    badgeClass: "text-slate-600 bg-slate-100",
  },
};

export function AIInsightsPanel({
  insights,
  loading = false,
}: AIInsightsPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-navy-900">
              AI Financial Insights
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              FinPilot continuously analyzes available financial signals.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 divide-y divide-slate-100">
        {loading ? (
          <InsightSkeleton />
        ) : insights.length === 0 ? (
          <EmptyInsights />
        ) : (
          insights.map((insight) => (
            <InsightItem key={insight.id} insight={insight} />
          ))
        )}
      </div>
    </section>
  );
}

function InsightItem({ insight }: { insight: AIInsight }) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <article className="group py-4 first:pt-0 last:pb-0">
      <div className="flex gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {insight.category}
            </span>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badgeClass}`}
            >
              {insight.severity}
            </span>
          </div>

          <h3 className="mt-1 text-sm font-semibold text-navy-900">
            {insight.title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {insight.description}
          </p>

          {insight.actionLabel && insight.actionTo && (
            <Link
              to={insight.actionTo}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent-teal hover:underline"
            >
              {insight.actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyInsights() {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
        <Sparkles className="h-5 w-5 text-slate-400" />
      </div>

      <p className="mt-4 text-sm font-semibold text-navy-900">
        No AI insights available
      </p>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
        AI insights will appear once financial activity is available.
      </p>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}