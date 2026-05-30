import { HardDrive } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";

interface InfrastructureHubHeaderProps {
  readonly hostCount: number | null;
  readonly podCount: number | null;
  readonly alertCount: number | null;
}

function buildSubtitle(hostCount: number | null, podCount: number | null): string {
  const parts: string[] = [];
  if (hostCount != null) parts.push(`${hostCount} hosts`);
  if (podCount != null) parts.push(`${podCount} pods`);
  return parts.join(" · ");
}

export function InfrastructureHubHeader({
  hostCount,
  podCount,
  alertCount,
}: InfrastructureHubHeaderProps) {
  const subtitle = buildSubtitle(hostCount, podCount);
  return (
    <header className="flex items-start gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-primary">
        <HardDrive size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[22px] text-foreground leading-tight">
            Infrastructure
          </h1>
          {alertCount != null && alertCount > 0 && (
            <Pill variant="warning" dot>
              {alertCount} in alert
            </Pill>
          )}
        </div>
        {subtitle && (
          <div className="mt-1 text-[12px] text-foreground-muted">{subtitle}</div>
        )}
      </div>
    </header>
  );
}
