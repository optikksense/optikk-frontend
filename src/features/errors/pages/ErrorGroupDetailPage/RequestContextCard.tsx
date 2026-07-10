import { PageSurface } from "@shared/components/ui";

import type { ErrorLatestOccurrence } from "@shared/api/errors";

interface Props {
  readonly occurrence: ErrorLatestOccurrence | null | undefined;
}

interface Row {
  readonly k: string;
  readonly v: string;
  readonly bad?: boolean;
}

function fmtDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

/** Key/value request context of the group's most recent error span. */
export function RequestContextCard({ occurrence }: Props): JSX.Element | null {
  if (!occurrence) return null;

  const statusNum = Number.parseInt(occurrence.http_status_code, 10);
  const rows: Row[] = [
    { k: "http.method", v: occurrence.http_method },
    { k: "http.route", v: occurrence.http_route },
    {
      k: "http.status",
      v: occurrence.http_status_code,
      bad: Number.isFinite(statusNum) && statusNum >= 400,
    },
    { k: "duration", v: fmtDuration(occurrence.duration_ms), bad: occurrence.duration_ms >= 1000 },
    { k: "trace_id", v: occurrence.trace_id },
    { k: "span_id", v: occurrence.span_id },
    { k: "service.version", v: occurrence.service_version },
    { k: "env", v: occurrence.environment },
    { k: "kube_pod", v: occurrence.pod },
    { k: "host", v: occurrence.host },
  ].filter((r) => r.v && r.v.length > 0);

  return (
    <PageSurface padding="lg">
      <div className="mb-3 font-semibold text-[13px] text-foreground">
        Request context · latest occurrence
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.k}
            className="flex items-center justify-between gap-3 border-border/60 border-b pb-2"
          >
            <span className="font-mono text-[12.5px] text-foreground-muted">{r.k}</span>
            <span
              className={`truncate font-mono font-semibold text-[12.5px] ${
                r.bad ? "text-[var(--err)]" : "text-foreground"
              }`}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </PageSurface>
  );
}
