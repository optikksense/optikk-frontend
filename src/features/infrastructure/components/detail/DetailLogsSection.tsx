import { useNavigate } from "@tanstack/react-router";

import { Button } from "@shared/components/primitives/ui/button";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { ScopedLogsPanel } from "@shared/logs/components/ScopedLogsPanel";
import {
  buildLogsHubHref,
  hostEqualsFilter,
  podEqualsFilter,
} from "@shared/observability/deepLinks";

const KIND = {
  host: { field: "host", noun: "host", hubFilter: hostEqualsFilter },
  pod: { field: "pod", noun: "pod", hubFilter: podEqualsFilter },
} as const;

interface DetailLogsSectionProps {
  readonly kind: keyof typeof KIND;
  readonly entity: string;
}

// Logs explorer scoped to one host or pod, shared by the host and container
// detail pages.
export function DetailLogsSection({ kind, entity }: DetailLogsSectionProps) {
  const { field, noun, hubFilter } = KIND[kind];
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();

  const openLogs = (): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [hubFilter(entity)],
        fromMs: Number(startTime),
        toMs: Number(endTime),
      }) as never,
    });
  };

  return (
    <section className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-[13px] text-foreground">Logs</div>
          <div className="text-[11px] text-foreground-muted">
            Logs from this {noun} in the current time range
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={openLogs}>
          Open in Logs
        </Button>
      </div>

      <ScopedLogsPanel field={field} value={entity} />
    </section>
  );
}
