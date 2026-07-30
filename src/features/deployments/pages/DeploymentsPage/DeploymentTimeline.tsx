import EmptyState from "@shared/components/ui/feedback/EmptyState";
import { formatTimestamp } from "@shared/utils/formatters";
import type { Deployment } from "../../api/deploymentsApi";

interface DeploymentTimelineProps {
  readonly rows: Deployment[];
  readonly onOpen: (deployment: Deployment) => void;
}

export function DeploymentTimeline({ rows, onOpen }: DeploymentTimelineProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No deployments"
        description="No versioned deployments match the current filters."
      />
    );
  }

  const start = Math.min(...rows.map((row) => new Date(row.firstSeen).getTime()));
  const end = Math.max(...rows.map((row) => new Date(row.timelineEnd).getTime()));
  const span = Math.max(1, end - start);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[220px_1fr] gap-3 px-3 pb-2 text-[10px] text-foreground-muted uppercase tracking-[0.08em]">
        <span>Deployment</span>
        <div className="flex justify-between">
          <span>{formatTimestamp(start)}</span>
          <span>{formatTimestamp(end)}</span>
        </div>
      </div>
      {rows.map((row) => {
        const firstSeen = new Date(row.firstSeen).getTime();
        const timelineEnd = new Date(row.timelineEnd).getTime();
        const left = ((firstSeen - start) / span) * 100;
        const width = Math.max(0.8, ((timelineEnd - firstSeen) / span) * 100);
        return (
          <button
            key={`${row.service}-${row.environment}-${row.version}`}
            type="button"
            className="grid min-h-12 grid-cols-[220px_1fr] items-center gap-3 rounded-md px-3 text-left transition-colors hover:bg-accent"
            onClick={() => onOpen(row)}
          >
            <span className="min-w-0">
              <span className="block truncate font-semibold text-[12px] text-foreground">
                {row.service}
              </span>
              <span className="block truncate font-mono text-[10.5px] text-foreground-muted">
                {row.version} · {row.environment || "default"}
              </span>
            </span>
            <span className="relative h-7 rounded bg-muted/70">
              <span
                className="absolute top-1 bottom-1 rounded bg-primary/75 shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-primary),transparent_35%)]"
                style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                title={`${row.version}: ${formatTimestamp(row.firstSeen)} → ${formatTimestamp(row.timelineEnd)}`}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
