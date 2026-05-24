import { cn } from "@/lib/utils";

import { fmtDelta, fmtMs, fmtNum, fmtPct } from "../formatters";
import type { EndpointWithDelta } from "../hooks/useTopEndpoints";
import { useTopEndpoints } from "../hooks/useTopEndpoints";
import { PanelCard } from "./PanelCard";

const COL_HEAD =
  "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]";
const COL_BODY = "px-3 py-2 align-middle text-[12px] text-[var(--text-primary)]";
const COL_NUM =
  "px-3 py-2 align-middle text-right font-mono text-[12px] text-[var(--text-primary)]";

function ErrorCell({ rate }: { rate: number }) {
  const tone =
    rate >= 0.02
      ? "text-[var(--color-error,#ef4444)]"
      : rate >= 0.005
        ? "text-[var(--color-warning,#f59e0b)]"
        : "text-[var(--text-primary)]";
  return <span className={tone}>{fmtPct(rate, rate < 0.001 ? 3 : 2)}</span>;
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta == null) return <span className="text-[var(--text-muted)]">—</span>;
  const formatted = fmtDelta(1 + delta, 1);
  if (!formatted) return <span className="text-[var(--text-muted)]">0%</span>;
  const tone =
    formatted.direction === "up"
      ? "text-[var(--color-error,#ef4444)]"
      : formatted.direction === "down"
        ? "text-[var(--color-success,#10b981)]"
        : "text-[var(--text-muted)]";
  return <span className={tone}>{formatted.label}</span>;
}

function EndpointTypeBadge({ row }: { row: EndpointWithDelta }) {
  const kind = row.span_kind || "http";
  return (
    <span className="inline-flex h-5 items-center rounded bg-[var(--bg-elevated,rgba(255,255,255,0.06))] px-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
      {kind.toLowerCase()}
    </span>
  );
}

function Row({ row, maxRows }: { row: EndpointWithDelta; maxRows: number }) {
  return (
    <tr className={cn("border-[var(--border-color)] border-t", maxRows > 25 ? "" : "h-10")}>
      <td className={COL_BODY}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-[12px] text-[var(--text-primary)]">
            {row.operation_name}
          </span>
          {row.http_route && (
            <span className="font-mono text-[11px] text-[var(--text-muted)]">{row.http_route}</span>
          )}
        </div>
      </td>
      <td className={COL_BODY}>
        <EndpointTypeBadge row={row} />
      </td>
      <td className={COL_NUM}>{fmtNum(row.rps)}</td>
      <td className={COL_NUM}>
        <ErrorCell rate={row.error_rate} />
      </td>
      <td className={COL_NUM}>{fmtMs(row.p50_ms)}</td>
      <td className={COL_NUM}>{fmtMs(row.p95_ms)}</td>
      <td className={COL_NUM}>{fmtMs(row.p99_ms)}</td>
      <td className={COL_NUM}>
        <DeltaCell delta={row.p99_delta_pct} />
      </td>
    </tr>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="bg-[var(--bg-elevated,rgba(255,255,255,0.03))]">
        <th className={COL_HEAD}>Resource</th>
        <th className={COL_HEAD}>Type</th>
        <th className={cn(COL_HEAD, "text-right")}>Rate /s</th>
        <th className={cn(COL_HEAD, "text-right")}>Error %</th>
        <th className={cn(COL_HEAD, "text-right")}>p50</th>
        <th className={cn(COL_HEAD, "text-right")}>p95</th>
        <th className={cn(COL_HEAD, "text-right")}>p99</th>
        <th className={cn(COL_HEAD, "text-right")}>Δ p99</th>
      </tr>
    </thead>
  );
}

interface EndpointsTablePanelProps {
  readonly serviceName: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly maxRows?: number;
}

export function EndpointsTablePanel({
  serviceName,
  title = "Top endpoints",
  subtitle,
  maxRows = 8,
}: EndpointsTablePanelProps) {
  const { data, isPending } = useTopEndpoints(serviceName, Math.max(maxRows, 50));
  const rows = (data ?? []).slice(0, maxRows);
  return (
    <PanelCard
      title={title}
      subtitle={subtitle ?? (data ? `${data.length} resources · sorted by rate` : undefined)}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No endpoints in selected range."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <TableHeader />
            <tbody>
              {rows.map((row) => (
                <Row
                  key={`${row.service_name}::${row.operation_name}`}
                  row={row}
                  maxRows={maxRows}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}
