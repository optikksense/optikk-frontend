import { cn } from "@shared/lib/utils";

import { HEALTH_DOT_CLASS, HEALTH_RING_CLASS, type HealthStatus } from "./healthStatus";

interface StatusDotProps {
  readonly status: HealthStatus;
  readonly ring?: boolean;
  readonly className?: string;
}

export function StatusDot({ status, ring = false, className }: StatusDotProps) {
  return (
    <span
      title={status}
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        HEALTH_DOT_CLASS[status],
        ring && cn("ring-2", HEALTH_RING_CLASS[status]),
        className
      )}
    />
  );
}
