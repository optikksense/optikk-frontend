import { useNavigate } from "@tanstack/react-router";

import { Button } from "@shared/components/primitives/ui";
import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { queryLogs } from "@shared/logs/api/logsQueryApi";
import type { LogRecord } from "@shared/logs/types/log";
import { severityStyle } from "@shared/logs/utils/severity";
import { buildLogsHubHref, podEqualsFilter } from "@shared/observability/deepLinks";
import { formatTime } from "@shared/utils/formatters";

const PREVIEW_LIMIT = 25;

interface ContainerDetailLogsProps {
  readonly pod: string;
}

function LogPreviewRow({ log }: { log: LogRecord }) {
  const sev = severityStyle(log.severity_bucket);
  return (
    <div className="flex items-baseline gap-3 border-border/60 border-b px-1 py-1.5 font-mono text-[11.5px] last:border-b-0">
      <span className="shrink-0 text-foreground-muted tabular-nums">
        {formatTime(log.timestamp)}
      </span>
      <span className="w-8 shrink-0 font-semibold" style={{ color: sev.color }} title={sev.label}>
        {sev.shortLabel}
      </span>
      <span className="max-w-[160px] shrink-0 truncate text-foreground-muted">
        {log.service_name || "—"}
      </span>
      <span className="min-w-0 flex-1 truncate text-foreground">{log.body}</span>
    </div>
  );
}

export function ContainerDetailLogs({ pod }: ContainerDetailLogsProps) {
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();

  const logsQ = useTimeRangeQuery(`container-detail.logs.${pod}`, (_tenant, s, e) =>
    queryLogs({
      startTime: Number(s),
      endTime: Number(e),
      filters: [{ field: "pod", op: "eq", value: pod }],
      limit: PREVIEW_LIMIT,
    })
  );
  const logs = logsQ.data?.results ?? [];

  const openLogs = (): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [podEqualsFilter(pod)],
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
            Latest {PREVIEW_LIMIT} log lines from this pod in the current time range
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={openLogs}>
          Open in Logs
        </Button>
      </div>
      {logs.length === 0 ? (
        <div className="grid h-[80px] place-items-center text-[12px] text-foreground-muted">
          {logsQ.isPending ? "Loading logs…" : "No logs from this pod in the current time range."}
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {logs.map((log) => (
            <LogPreviewRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </section>
  );
}
