import DataTable from "@shared/components/ui/data-display/DataTable";
import { ENDPOINT_HEALTH_THRESHOLDS, classifyHealth } from "@shared/constants/healthThresholds";
import { fmtNum, fmtPct, formatPercentage } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

export interface TopOpRow {
  readonly key: string;
  readonly badge: string;
  readonly badgeVariant: "brand" | "success";
  readonly label: string;
  readonly totalCount: number;
  readonly errorRate: number;
  readonly p99Ms: number;
  readonly p99DeltaPct: number | null;
}

interface TopOpsTableProps {
  rows: TopOpRow[];
  labelHeader: string;
  emptyText: string;
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function renderLatencyDelta(val: number | null) {
  if (val == null || Number.isNaN(val) || val === 0) {
    return <span className="font-mono text-[11.5px] text-foreground-muted">0%</span>;
  }
  const pct = val * 100;
  const sign = pct > 0 ? "+" : "";
  const color = pct > 0 ? "text-[var(--err)]" : "text-[var(--ok)]";
  return (
    <span className={`font-mono font-semibold text-[11.5px] ${color}`}>
      {sign}
      {formatPercentage(pct, 1, false)}
    </span>
  );
}

function buildColumns(labelHeader: string): ColumnDef<TopOpRow>[] {
  return [
    {
      header: labelHeader,
      accessorKey: "label",
      size: 240,
      cell: ({ row: { original: r } }) => (
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 font-bold font-mono text-[9px] ${
              r.badgeVariant === "brand"
                ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
            }`}
          >
            {r.badge}
          </span>
          <span className="max-w-[200px] truncate font-mono font-semibold text-[12px] text-foreground">
            {r.label}
          </span>
        </div>
      ),
    },
    {
      header: "Hits",
      accessorKey: "totalCount",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono text-[12.5px] tabular-nums">{fmtNum(r.totalCount)}</span>
      ),
    },
    {
      header: "Errors",
      accessorKey: "errorRate",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => {
        const health = classifyHealth(r.errorRate, ENDPOINT_HEALTH_THRESHOLDS);
        return (
          <span
            className={`font-mono font-semibold text-[12.5px] tabular-nums ${
              health === "unhealthy"
                ? "text-[var(--err)]"
                : health === "degraded"
                  ? "text-[var(--warn)]"
                  : "text-foreground-muted"
            }`}
          >
            {fmtPct(r.errorRate)}
          </span>
        );
      },
    },
    {
      header: "P99",
      accessorKey: "p99Ms",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono font-semibold text-[12.5px] tabular-nums">
          {Math.round(r.p99Ms)}ms
        </span>
      ),
    },
    {
      header: "Latency vs 1h ago",
      accessorKey: "p99DeltaPct",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => renderLatencyDelta(r.p99DeltaPct),
    },
  ];
}

export function TopOpsTable({
  rows,
  labelHeader,
  emptyText,
  page,
  hasMore,
  onPrev,
  onNext,
}: TopOpsTableProps): JSX.Element {
  if (rows.length === 0) {
    return <div className="py-8 text-center text-[12.5px] text-foreground-muted">{emptyText}</div>;
  }

  return (
    <div>
      <DataTable data={{ columns: buildColumns(labelHeader), rows }} />

      {/* Paging is server-driven (page/hasMore), so it stays outside DataTable. */}
      <div className="mt-4 flex items-center justify-between border-border/40 border-t pt-4">
        <div className="text-[11.5px] text-foreground-muted">Showing page {page + 1}</div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={onPrev}
            className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasMore}
            onClick={onNext}
            className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
