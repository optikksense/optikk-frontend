import { memo } from "react";

import type { StatusTimelineResponse } from "../../api/monitorsApi";

interface Props {
  readonly data: StatusTimelineResponse | undefined;
}

const COLORS: Record<string, string> = {
  alert: "bg-error",
  warn: "bg-warning",
  ok: "bg-success",
  no_data: "bg-foreground-muted",
};

function StatusTimelineCard({ data }: Props) {
  const bands = data?.bands ?? [];
  const start = data ? new Date(data.started_at).getTime() : 0;
  const end = data ? new Date(data.ended_at).getTime() : 1;
  const total = Math.max(1, end - start);
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="text-sm font-medium text-[var(--text-primary)]">Status timeline · 24h</div>
      <div className="text-[11px] text-[var(--text-muted)]">
        green ok · yellow warn · red alert
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded bg-[var(--bg-secondary)]">
        {bands.length === 0 ? (
          <div className="h-full w-full bg-accent" />
        ) : (
          bands.map((b, i) => {
            const bandStart = new Date(b.started_at).getTime();
            const bandEnd = new Date(b.ended_at).getTime();
            const width = ((bandEnd - bandStart) / total) * 100;
            return (
              <div
                key={`${b.status}-${i}`}
                className={`h-full ${COLORS[b.status] ?? "bg-foreground-muted"}`}
                style={{ width: `${width}%` }}
              />
            );
          })
        )}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>24h ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

export default memo(StatusTimelineCard);
