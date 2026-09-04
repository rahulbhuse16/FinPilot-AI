import { Badge } from "../ui/Badge";
import type { RiskTier } from "../../types/risk";

const TONE: Record<RiskTier, "risk" | "warning" | "neutral" | "positive"> = {
  CRITICAL: "risk",
  HIGH: "risk",
  MEDIUM: "warning",
  LOW: "positive",
};

export function RiskTierBadge({ tier }: { tier: RiskTier }) {
  return <Badge tone={TONE[tier] ?? "neutral"}>{tier}</Badge>;
}
