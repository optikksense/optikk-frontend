import { useNavigate } from "@tanstack/react-router";

import { Button } from "@shared/components/primitives/ui/button";
import { SectionCard } from "@shared/components/ui/layout/SectionCard";
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

/** A detail page is a narrow, scoped view — smaller pages than the /logs hub. */
const PAGE_SIZE = 25;

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
    <SectionCard
      title="Logs"
      description={`Logs from this ${noun} in the current time range`}
      action={
        <Button variant="secondary" size="sm" onClick={openLogs}>
          Open in Logs
        </Button>
      }
    >
      <ScopedLogsPanel field={field} value={entity} pageSize={PAGE_SIZE} />
    </SectionCard>
  );
}
