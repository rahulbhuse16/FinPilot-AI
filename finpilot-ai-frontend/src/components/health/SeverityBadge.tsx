import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { SeverityLevel } from "../../types/financialHealth";

const CONFIG: Record<SeverityLevel, { tone: "positive" | "warning" | "risk"; icon: typeof Info }> = {
  INFO: { tone: "positive", icon: Info },
  WARNING: { tone: "warning", icon: AlertTriangle },
  CRITICAL: { tone: "risk", icon: AlertOctagon },
};

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  const config = CONFIG[severity] ?? CONFIG.INFO;
  const Icon = config.icon;
  return (
    <Badge tone={config.tone}>
      <Icon className="h-3 w-3" />
      {severity}
    </Badge>
  );
}
