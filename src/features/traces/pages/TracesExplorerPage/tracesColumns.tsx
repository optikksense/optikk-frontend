import type { ColumnDef } from "@/features/explorer/types/results";

import type { TraceSummary } from "../../types/trace";

/**
 * ColumnDef shape for the traces list. Keys line up with `DEFAULT_TRACE_COLUMNS`
 * (features/traces/config/columns.ts) so `useExplorerColumns` can toggle them.
 */
export const TRACE_COLUMN_DEFS: readonly ColumnDef<TraceSummary>[] = [
  {
    key: "start",
    label: "Start",
    width: 170,
    render: (row) => (
      <span className="font-mono text-xs text-[var(--text-secondary)]">
        {new Date(row.start_ms).toISOString().slice(11, 23).replace("T", "")}
      </span>
    ),
  },
  {
    key: "duration",
    label: "Duration",
    width: 140,
    render: (row) => <DurationCell ns={row.duration_ns} hasError={row.has_error} />,
  },
  {
    key: "service",
    label: "Service",
    width: 160,
    render: (row) => <span className="truncate text-sm">{row.root_service}</span>,
  },
  {
    key: "operation",
    label: "Operation",
    render: (row) => <span className="truncate text-sm">{row.root_operation}</span>,
  },
  {
    key: "endpoint",
    label: "Endpoint",
    width: 200,
    render: (row) => <span className="truncate text-xs">{row.root_endpoint ?? ""}</span>,
  },
  {
    key: "status",
    label: "Status",
    width: 96,
    render: (row) => <StatusBadge status={row.root_status} hasError={row.has_error} />,
  },
  {
    key: "http_method",
    label: "Method",
    width: 80,
    render: (row) => (
      <span className="font-mono text-xs uppercase">{row.root_http_method ?? ""}</span>
    ),
  },
  {
    key: "root_http_status",
    label: "HTTP",
    width: 80,
    render: (row) => (
      <span className="font-mono text-xs">{row.root_http_status ?? ""}</span>
    ),
  },
  {
    key: "span_count",
    label: "Spans",
    width: 80,
    render: (row) => <span className="font-mono text-xs">{row.span_count}</span>,
  },
  {
    key: "has_error",
    label: "Error",
    width: 72,
    render: (row) => (row.has_error ? <span className="text-xs text-[#e8494d]">●</span> : null),
  },
  {
    key: "environment",
    label: "Env",
    width: 120,
    render: (row) => <span className="truncate text-xs">{row.environment ?? ""}</span>,
  },
];

function DurationCell({ ns, hasError }: { ns: number; hasError: boolean }) {
  const ms = ns / 1e6;
  const label = ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
  return (
    <span className="font-mono text-xs" style={{ color: hasError ? "#e8494d" : undefined }}>
      {label}
    </span>
  );
}

function StatusBadge({ status, hasError }: { status: string | undefined; hasError: boolean }) {
  const color = hasError ? "#e8494d" : status === "OK" ? "#73bf69" : "#7e8ea0";
  const label = hasError ? "ERROR" : status || "UNSET";
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

export function getTraceRowId(row: TraceSummary): string {
  return row.trace_id;
}
