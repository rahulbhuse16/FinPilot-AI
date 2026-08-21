import { CheckCircle2, Loader2, XCircle, UploadCloud } from "lucide-react";
import type { DocumentStatus as Status } from "../../types/domain";
import { cn } from "../../utils/cn";

const CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; className: string; spin?: boolean }> = {
  uploading: { label: "Uploading", icon: UploadCloud, className: "bg-slate-100 text-slate-600" },
  processing: { label: "Processing", icon: Loader2, className: "bg-warning-soft text-warning", spin: true },
  ready: { label: "Ready", icon: CheckCircle2, className: "bg-positive-soft text-positive" },
  failed: { label: "Failed", icon: XCircle, className: "bg-risk-soft text-risk" },
};

export function DocumentStatus({ status }: { status: Status }) {
  const config = CONFIG[status] ?? CONFIG.processing;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.className)}>
      <Icon className={cn("h-3.5 w-3.5", config.spin && "animate-spin")} strokeWidth={2} />
      {config.label}
    </span>
  );
}
