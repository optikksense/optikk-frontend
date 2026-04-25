import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { ColumnDef } from "@/features/explorer/types/results";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";

import { useSpansQuery } from "../../hooks/useSpansQuery";
import type { SpanRow } from "../../types/span";

interface Props {
  readonly filters: readonly ExplorerFilter[];
}

/** Span-level explorer results: one row per span, paginated by timestamp. */
export function SpansResultsPane({ filters }: Props) {
  const query = useSpansQuery({ filters });
  const navigate = useNavigate();
  const rows = query.data?.spans ?? [];
  const queryError = query.isError ? formatErrorForDisplay(query.error) : null;
  const columns = useMemo(() => SPAN_COLUMNS, []);
  const onRowClick = useCallback(
    (row: SpanRow) => navigate({ to: `/traces/${encodeURIComponent(row.trace_id)}`, search: { span: row.span_id } as never }),
    [navigate],
  );

  return (
    <ResultsArea<SpanRow>
      rows={rows}
      columns={columns}
      config={SPAN_COLUMN_CONFIG}
      onConfigChange={() => {}}
      getRowId={(r) => r.span_id}
      onRowClick={onRowClick}
      resetKey={JSON.stringify(filters)}
      loading={query.isPending}
      queryError={queryError}
      onRetry={() => { void query.refetch(); }}
      emptyTitle="No spans"
      emptyDescription="Adjust filters or broaden the time range."
    />
  );
}

const SPAN_COLUMNS: readonly ColumnDef<SpanRow>[] = [
  {
    key: "timestamp",
    label: "Time",
    width: 170,
    render: (row) => (
      <span className="font-mono text-xs text-[var(--text-secondary)]">
        {new Date(row.timestamp_ns / 1_000_000).toISOString().slice(11, 23)}
      </span>
    ),
  },
  {
    key: "duration",
    label: "Duration",
    width: 100,
    render: (row) => (
      <span className="font-mono text-xs" style={{ color: row.has_error ? "#e8494d" : undefined }}>
        {formatMs(row.duration_ms)}
      </span>
    ),
  },
  { key: "service_name", label: "Service", width: 160, render: (row) => <span className="truncate text-sm">{row.service_name}</span> },
  { key: "operation", label: "Operation", render: (row) => <span className="truncate text-sm">{row.operation}</span> },
  { key: "kind", label: "Kind", width: 90, render: (row) => <span className="font-mono text-xs">{row.kind ?? ""}</span> },
  { key: "status", label: "Status", width: 96, render: (row) => <StatusBadge status={row.status} hasError={row.has_error} /> },
  { key: "http_method", label: "Method", width: 80, render: (row) => <span className="font-mono text-xs uppercase">{row.http_method ?? ""}</span> },
  { key: "http_status", label: "HTTP", width: 72, render: (row) => <span className="font-mono text-xs">{row.response_status_code ?? ""}</span> },
  { key: "trace_id", label: "Trace", width: 140, render: (row) => <span className="truncate font-mono text-[11px] text-[var(--text-muted)]">{row.trace_id.slice(0, 12)}…</span> },
];

const SPAN_COLUMN_CONFIG = SPAN_COLUMNS.map((c) => ({ key: c.key, visible: true }));

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

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}
