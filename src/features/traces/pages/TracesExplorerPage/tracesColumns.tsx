import { Tooltip } from "@shared/components/primitives/ui";

import type { ColumnDef } from "@/features/explorer/types/results";

import type { TraceSummary } from "../../types/trace";
import { getServiceColor } from "../../utils/serviceColor";

/**
 * ColumnDef factory for the traces list. Keys line up with `DEFAULT_TRACE_COLUMNS`
 * (features/traces/config/columns.ts) so `useExplorerColumns` can toggle them.
 */
export function buildTraceColumns(): readonly ColumnDef<TraceSummary>[] {
  return [
    { key: "start", label: "Start", width: 170, render: renderStart },
    { key: "duration", label: "Duration", width: 180, render: (row) => <DurationCell row={row} /> },
    { key: "service", label: "Service", width: 160, render: renderService },
    { key: "operation", label: "Operation", render: renderOperation },
    { key: "endpoint", label: "Endpoint", width: 200, render: (row) => <span className="truncate text-xs">{row.root_endpoint ?? ""}</span> },
    { key: "status", label: "Status", width: 80, render: (row) => <StatusDot status={row.root_status} hasError={row.has_error} /> },
    { key: "http_method", label: "Method", width: 80, render: (row) => <span className="font-mono text-xs uppercase">{row.root_http_method ?? ""}</span> },
    { key: "root_http_status", label: "HTTP", width: 80, render: (row) => <span className="font-mono text-xs">{row.root_http_status ?? ""}</span> },
    { key: "span_count", label: "Spans", width: 80, render: (row) => <span className="font-mono text-xs">{row.span_count}</span> },
    { key: "has_error", label: "Error", width: 72, render: (row) => (row.has_error ? <span className="text-xs text-[#e8494d]">●</span> : null) },
    { key: "environment", label: "Env", width: 120, render: (row) => <span className="truncate text-xs">{row.environment ?? ""}</span> },
  ];
}

function renderStart(row: TraceSummary) {
  return (
    <span className="font-mono text-xs text-[var(--text-secondary)]">
      {new Date(row.start_ms).toISOString().slice(11, 23).replace("T", "")}
    </span>
  );
}

function renderService(row: TraceSummary) {
  const color = getServiceColor(row.root_service);
  return (
    <span className="flex min-w-0 items-center gap-1.5 truncate">
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="truncate text-sm">{row.root_service}</span>
    </span>
  );
}

function renderOperation(row: TraceSummary) {
  const text = row.root_operation;
  return (
    <Tooltip content={text} placement="bottom">
      <span className="block truncate text-sm">{text}</span>
    </Tooltip>
  );
}

function DurationCell({ row }: { row: TraceSummary }) {
  const ms = row.duration_ns / 1e6;
  const color = row.has_error ? "#e8494d" : undefined;
  return (
    <span className="font-mono text-xs" style={{ color }}>{formatMs(ms)}</span>
  );
}

function StatusDot({ status, hasError }: { status: string | undefined; hasError: boolean }) {
  let dotColor: string;
  let label: string;
  let textColor: string;

  if (hasError || status?.toUpperCase() === "ERROR") {
    dotColor = "#e8494d";
    label = "Error";
    textColor = "text-red-400";
  } else if (!status || status.toUpperCase() === "UNSET") {
    dotColor = "#7e8ea0";
    label = "Unset";
    textColor = "text-slate-400";
  } else {
    dotColor = "#73bf69";
    label = "OK";
    textColor = "text-emerald-400";
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${textColor}`}>
      <span
        className="inline-block size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden
      />
      {label}
    </span>
  );
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export function getTraceRowId(row: TraceSummary): string {
  return row.trace_id;
}
