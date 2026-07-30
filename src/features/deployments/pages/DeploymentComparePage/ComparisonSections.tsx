import DataTable from "@shared/components/ui/data-display/DataTable";
import EmptyState from "@shared/components/ui/feedback/EmptyState";
import { PageSurface } from "@shared/components/ui/layout/PageShell";
import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatTimestamp,
} from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  DeploymentCompare,
  DimensionDiff,
  ErrorChange,
  MetricComparison,
} from "../../api/deploymentsApi";

type MetricKind = "count" | "percent" | "duration";

interface MetricRow {
  section: string;
  metric: string;
  kind: MetricKind;
  value: MetricComparison;
}

function formatMetric(value: number | null, kind: MetricKind): string {
  if (value == null) return "—";
  if (kind === "duration") return formatDuration(value);
  if (kind === "percent") return formatPercentage(value, value < 0.1 ? 3 : 2, false);
  return formatNumber(value);
}

function formatDelta(row: MetricRow): string {
  if (row.value.delta == null) return "—";
  if (row.kind === "percent") {
    return `${row.value.delta >= 0 ? "+" : ""}${row.value.delta.toFixed(2)} pp`;
  }
  const direct =
    row.kind === "duration"
      ? `${row.value.delta >= 0 ? "+" : "-"}${formatDuration(Math.abs(row.value.delta))}`
      : `${row.value.delta >= 0 ? "+" : ""}${formatNumber(row.value.delta)}`;
  const relative =
    row.value.deltaPercent == null
      ? ""
      : ` (${row.value.deltaPercent >= 0 ? "+" : ""}${row.value.deltaPercent.toFixed(1)}%)`;
  return `${direct}${relative}`;
}

const metricColumns: ColumnDef<MetricRow>[] = [
  {
    header: "Group",
    accessorKey: "section",
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">
        {String(getValue())}
      </span>
    ),
  },
  {
    header: "Metric",
    accessorKey: "metric",
    size: 150,
    cell: ({ getValue }) => (
      <span className="font-medium text-[12px] text-foreground">{String(getValue())}</span>
    ),
  },
  {
    header: "Current",
    id: "current",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[12px] tabular-nums">
        {formatMetric(row.value.current, row.kind)}
      </span>
    ),
  },
  {
    header: "Baseline",
    id: "baseline",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[12px] text-foreground-secondary tabular-nums">
        {formatMetric(row.value.baseline, row.kind)}
      </span>
    ),
  },
  {
    header: "Delta",
    id: "delta",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => {
      const delta = row.value.delta;
      return (
        <span
          className={`font-mono text-[11.5px] tabular-nums ${
            delta == null
              ? "text-foreground-muted"
              : delta > 0
                ? "text-error"
                : delta < 0
                  ? "text-success"
                  : "text-foreground-muted"
          }`}
        >
          {formatDelta(row)}
        </span>
      );
    },
  },
];

export function MetricMatrix({ comparison }: { readonly comparison: DeploymentCompare }) {
  const { metrics, context } = comparison;
  const rows: MetricRow[] = [
    { section: "Traffic", metric: "Requests", kind: "count", value: metrics.requests },
    { section: "Errors", metric: "Error count", kind: "count", value: metrics.errors },
    { section: "Errors", metric: "Error rate", kind: "percent", value: metrics.errorRate },
    { section: "Latency", metric: "P50", kind: "duration", value: metrics.p50Ms },
    { section: "Latency", metric: "P75", kind: "duration", value: metrics.p75Ms },
    { section: "Latency", metric: "P90", kind: "duration", value: metrics.p90Ms },
    { section: "Latency", metric: "P95", kind: "duration", value: metrics.p95Ms },
    { section: "Latency", metric: "P99", kind: "duration", value: metrics.p99Ms },
  ];

  return (
    <PageSurface padding="md" className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 font-semibold text-[14px] text-foreground">Version comparison</h2>
        <p className="mt-1 mb-0 text-[11.5px] text-foreground-muted">
          Equal-length windows: current {formatTimestamp(context.window.currentStart)} →{" "}
          {formatTimestamp(context.window.currentEnd)}; baseline{" "}
          {formatTimestamp(context.window.baselineStart)} →{" "}
          {formatTimestamp(context.window.baselineEnd)}. The baseline can extend before the selected
          picker range.
        </p>
      </div>
      <DataTable data={{ columns: metricColumns, rows }} config={{ maxRows: 8, rowHeight: 44 }} />
    </PageSurface>
  );
}

const errorColumns: ColumnDef<ErrorChange>[] = [
  {
    header: "Error type",
    accessorKey: "exceptionType",
    cell: ({ row: { original: row } }) => (
      <div className="min-w-0">
        <span className="block truncate font-medium font-mono text-[12px] text-foreground">
          {row.exceptionType || row.operationName || row.groupId}
        </span>
        <span className="block truncate text-[10.5px] text-foreground-muted">
          {row.operationName || "Operation unavailable"}
        </span>
      </div>
    ),
  },
  {
    header: "Current",
    accessorKey: "currentCount",
    size: 80,
    meta: { align: "right" },
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums">{formatNumber(Number(getValue()))}</span>
    ),
  },
  {
    header: "Baseline",
    accessorKey: "baselineCount",
    size: 80,
    meta: { align: "right" },
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums">{formatNumber(Number(getValue()))}</span>
    ),
  },
];

interface ErrorChangesProps {
  readonly title: string;
  readonly description: string;
  readonly rows: ErrorChange[];
  readonly loading: boolean;
  readonly error?: string;
}

export function ErrorChangesCard({ title, description, rows, loading, error }: ErrorChangesProps) {
  return (
    <PageSurface padding="md" className="min-w-0">
      <div className="mb-3">
        <h2 className="m-0 font-semibold text-[13.5px] text-foreground">
          {title} <span className="ml-1 text-foreground-muted">{rows.length}</span>
        </h2>
        <p className="mt-1 mb-0 text-[11px] text-foreground-muted">{description}</p>
      </div>
      {error ? (
        <div className="rounded-md border border-error/30 bg-error-subtle px-3 py-5 text-center text-[11.5px] text-error">
          {error}
        </div>
      ) : (
        <DataTable
          data={{ columns: errorColumns, rows, loading }}
          config={{
            maxRows: 6,
            rowHeight: 48,
            emptyText: "No error-type changes in these windows.",
          }}
        />
      )}
    </PageSurface>
  );
}

const dimensionColumns: ColumnDef<DimensionDiff>[] = [
  {
    header: "Name",
    accessorKey: "name",
    size: 240,
    cell: ({ getValue }) => (
      <span className="font-medium font-mono text-[11.5px] text-foreground">
        {String(getValue())}
      </span>
    ),
  },
  {
    header: "Current requests",
    id: "currentRequests",
    meta: { align: "right" },
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{formatNumber(row.original.current.requests)}</span>
    ),
  },
  {
    header: "Baseline requests",
    id: "baselineRequests",
    meta: { align: "right" },
    cell: ({ row }) => (
      <span className="font-mono text-foreground-secondary tabular-nums">
        {row.original.baseline ? formatNumber(row.original.baseline.requests) : "—"}
      </span>
    ),
  },
  {
    header: "Error Δ",
    accessorKey: "errorRateDelta",
    meta: { align: "right" },
    cell: ({ getValue }) => {
      const value = getValue<number | null>();
      return (
        <span className="font-mono tabular-nums">
          {value == null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)} pp`}
        </span>
      );
    },
  },
  {
    header: "P95 Δ",
    accessorKey: "p95DeltaMs",
    meta: { align: "right" },
    cell: ({ getValue }) => {
      const value = getValue<number | null>();
      return (
        <span className="font-mono tabular-nums">
          {value == null ? "—" : `${value >= 0 ? "+" : "-"}${formatDuration(Math.abs(value))}`}
        </span>
      );
    },
  },
];

interface DimensionCardProps {
  readonly title: string;
  readonly description: string;
  readonly rows: DimensionDiff[];
  readonly loading: boolean;
  readonly error?: string;
}

export function DimensionCard({ title, description, rows, loading, error }: DimensionCardProps) {
  return (
    <PageSurface padding="md" className="flex min-w-0 flex-col gap-3">
      <div>
        <h2 className="m-0 font-semibold text-[14px] text-foreground">{title}</h2>
        <p className="mt-1 mb-0 text-[11px] text-foreground-muted">{description}</p>
      </div>
      {error ? (
        <div className="rounded-md border border-error/30 bg-error-subtle px-3 py-5 text-center text-[11.5px] text-error">
          {error}
        </div>
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="No data" description={`No ${title.toLowerCase()} were observed.`} />
      ) : (
        <DataTable
          data={{ columns: dimensionColumns, rows, loading }}
          config={{ maxRows: 7, rowHeight: 44 }}
        />
      )}
    </PageSurface>
  );
}
