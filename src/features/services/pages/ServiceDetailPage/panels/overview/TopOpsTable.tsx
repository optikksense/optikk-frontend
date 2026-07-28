import { ENDPOINT_HEALTH_THRESHOLDS, classifyHealth } from "@shared/constants/healthThresholds";
import { fmtNum } from "@shared/utils/formatters";

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
      {pct.toFixed(1)}%
    </span>
  );
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-border/60 border-b font-semibold text-[10px] text-foreground-muted uppercase tracking-wider">
            <th className="px-3 py-2 pl-0">{labelHeader}</th>
            <th className="px-3 py-2 text-right">Hits</th>
            <th className="px-3 py-2 text-right">Errors</th>
            <th className="px-3 py-2 text-right">P99</th>
            <th className="px-3 py-2 text-right">Latency vs 1h ago</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const health = classifyHealth(r.errorRate, ENDPOINT_HEALTH_THRESHOLDS);
            return (
              <tr
                key={r.key}
                className="border-border/40 border-b last:border-b-0 hover:bg-muted/10"
              >
                <td className="px-3 py-3 pl-0">
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
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12.5px] tabular-nums">
                  {fmtNum(r.totalCount)}
                </td>
                <td
                  className={`px-3 py-3 text-right font-mono font-semibold text-[12.5px] tabular-nums ${
                    health === "unhealthy"
                      ? "text-[var(--err)]"
                      : health === "degraded"
                        ? "text-[var(--warn)]"
                        : "text-foreground-muted"
                  }`}
                >
                  {r.errorRate.toFixed(2)}%
                </td>
                <td className="px-3 py-3 text-right font-mono font-semibold text-[12.5px] tabular-nums">
                  {Math.round(r.p99Ms)}ms
                </td>
                <td className="px-3 py-3 text-right">{renderLatencyDelta(r.p99DeltaPct)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
