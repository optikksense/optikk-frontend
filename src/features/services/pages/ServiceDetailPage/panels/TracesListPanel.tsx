import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import type { TraceRecord } from "@shared/entities/trace/model";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtMs, relativeTimeFromIso } from "@shared/utils/metricFormatters";
import { useRecentTraces } from "../hooks/useRecentTraces";

const STATUS_DOT: Record<string, string> = {
  OK: "bg-[var(--color-success,#10b981)]",
  ERROR: "bg-[var(--color-error,#ef4444)]",
  UNSET: "bg-[var(--color-info,#3b82f6)]",
};

function StatusDot({ status }: { status?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status ?? "UNSET"] ?? STATUS_DOT.UNSET}`}
    />
  );
}

function DurationBar({ ms, max }: { ms: number; max: number }) {
  const width = max > 0 ? Math.max(2, Math.round((ms / max) * 100)) : 0;
  const tone =
    ms >= 2000
      ? "bg-[var(--color-error,#ef4444)]"
      : ms >= 1000
        ? "bg-[var(--color-warning,#f59e0b)]"
        : "bg-[var(--color-info,#3b82f6)]";
  return (
    <div className="relative h-1.5 w-full rounded bg-[var(--bg-elevated,rgba(255,255,255,0.05))]">
      <div className={`h-full rounded ${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function TraceRow({ trace, max }: { trace: TraceRecord; max: number }) {
  const detail = ROUTES.traceDetail.replace("$traceId", encodeURIComponent(trace.trace_id));
  return (
    <li className="border-border border-t first:border-t-0">
      <Link
        to={detail}
        className="grid grid-cols-[auto_minmax(0,1.5fr)_minmax(120px,1fr)_auto_auto] items-center gap-3 px-4 py-3 text-[12px] hover:bg-[var(--bg-elevated,rgba(255,255,255,0.04))]"
      >
        <StatusDot status={trace.status} />
        <div className="min-w-0">
          <div className="truncate font-mono text-[12px] text-foreground">
            {trace.operation_name}
          </div>
          <div className="truncate font-mono text-[11px] text-foreground-muted">
            {trace.trace_id}
          </div>
        </div>
        <DurationBar ms={trace.duration_ms} max={max} />
        <div className="font-mono text-[12px] text-foreground">{fmtMs(trace.duration_ms)}</div>
        <div className="text-right text-[11px] text-foreground-muted">
          {relativeTimeFromIso(trace.start_time)}
        </div>
      </Link>
    </li>
  );
}

interface TracesListPanelProps {
  readonly serviceName: string;
  readonly maxRows?: number;
  readonly title?: string;
}

export function TracesListPanel({
  serviceName,
  maxRows = 8,
  title = "Recent traces",
}: TracesListPanelProps) {
  const { data, isPending } = useRecentTraces(serviceName, Math.max(maxRows, 25));
  const traces = (data?.traces ?? []).slice(0, maxRows);
  const max = traces.reduce((acc, t) => Math.max(acc, t.duration_ms), 0);
  return (
    <PanelCard
      title={title}
      subtitle={data ? `${data.traces.length} traces` : undefined}
      padded={false}
    >
      {traces.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No traces in selected range."}
        </div>
      ) : (
        <ul>
          {traces.map((trace) => (
            <TraceRow key={trace.trace_id} trace={trace} max={max} />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
