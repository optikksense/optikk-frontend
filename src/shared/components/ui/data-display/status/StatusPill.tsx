import { Pill } from "@shared/components/primitives/ui/pill";

import { HEALTH_LABEL, HEALTH_PILL_VARIANT, type HealthStatus } from "./healthStatus";

interface StatusPillProps {
  readonly status: HealthStatus;
  readonly label?: string;
  readonly className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  return (
    <Pill variant={HEALTH_PILL_VARIANT[status]} dot className={className}>
      {label ?? HEALTH_LABEL[status]}
    </Pill>
  );
}
