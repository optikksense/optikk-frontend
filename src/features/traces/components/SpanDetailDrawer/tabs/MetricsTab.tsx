import { useMemo } from "react";

import { useTracesAnalytics } from "../../../hooks/useTracesAnalytics";
import type { ExplorerFilter, AnalyticsAggregation } from "@/features/explorer/types";

interface Span {
  readonly service_name?: string;
  readonly operation_name?: string;
}

const AGGS: readonly AnalyticsAggregation[] = [
  { fn: "count", alias: "count" },
  { fn: "p95", field: "duration_ns", alias: "p95" },
];
const EMPTY: readonly string[] = [];

/** Per-span RED metrics via /traces/analytics filtered by service+operation (O7). */
export function MetricsTab({ span }: { span: Span | null }) {
  const filters = useMemo<readonly ExplorerFilter[]>(() => buildFilters(span), [span]);
  const enabled = filters.length === 2;
  const q = useTracesAnalytics({
    filters,
    groupBy: EMPTY,
    aggregations: AGGS,
    step: "auto",
    vizMode: "table",
    enabled,
  });
  if (!span || !span.service_name || !span.operation_name) {
    return <Empty msg="Select a span with a service + operation to see metrics." />;
  }
  if (q.isPending) return <Empty msg="Loading metrics…" />;
  const row = q.data?.rows?.[0];
  if (!row) return <Empty msg="No metrics found in the current time window." />;
  const values = pickValues(q.data?.columns ?? [], row);
  return (
    <div className="p-3">
      <p className="mb-3 text-[11px] text-[var(--text-muted)]">
        RED for <span className="font-mono">{span.service_name} · {span.operation_name}</span> over the active time range.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Requests" value={formatCount(values.count)} tone="default" />
        <StatCard label="Errors" value={formatCount(values.errorCount)} tone={values.errorCount > 0 ? "error" : "default"} />
        <StatCard label="p95 latency" value={formatMs(values.p95Ns / 1_000_000)} tone="default" />
      </div>
    </div>
  );
}

function buildFilters(span: Span | null): readonly ExplorerFilter[] {
  if (!span?.service_name || !span.operation_name) return [];
  return [
    { field: "service", op: "eq", value: span.service_name },
    { field: "operation", op: "eq", value: span.operation_name },
  ];
}

interface Values {
  readonly count: number;
  readonly errorCount: number;
  readonly p95Ns: number;
}

function pickValues(
  columns: ReadonlyArray<{ name: string }>,
  row: ReadonlyArray<string | number>,
): Values {
  const idx = (name: string) => columns.findIndex((c) => c.name === name);
  const num = (v: string | number | undefined) => (typeof v === "number" ? v : Number(v ?? 0));
  return {
    count: num(row[idx("count")]),
    errorCount: num(row[idx("error_count")]),
    p95Ns: num(row[idx("p95")]),
  };
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "default" | "error" }) {
  const color = tone === "error" ? "#e8494d" : undefined;
  return (
    <div className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)] p-2">
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 font-mono text-[16px] font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}
