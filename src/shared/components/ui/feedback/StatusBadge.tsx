import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/badge";

import type { StatusBadgeProps } from "./types";

const HEALTH_VARIANT: Record<string, BadgeVariant> = {
  healthy: "success",
  degraded: "warning",
  unhealthy: "error",
  unknown: "default",
};

const TRACE_VARIANT: Record<string, BadgeVariant> = {
  OK: "success",
  ERROR: "error",
  UNSET: "default",
};

export default function StatusBadge({ status, type = "service" }: StatusBadgeProps): JSX.Element {
  const label = status?.toUpperCase() || "UNKNOWN";

  if (type === "trace") {
    return <Badge variant={TRACE_VARIANT[label] || "default"}>{label}</Badge>;
  }

  const variant = HEALTH_VARIANT[status?.toLowerCase()] || "default";
  return <Badge variant={variant}>{label}</Badge>;
}
