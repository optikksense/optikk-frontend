import { cn } from "@/lib/utils";

import type { DeploymentImpactRow } from "@shared/api/deployments/deploymentsApi";

import { fmtMs, fmtPct, relativeTimeFromIso } from "../formatters";
import { useServiceDeployImpact } from "../hooks/useServiceDeployImpact";
import { PanelCard } from "./PanelCard";

const COL_HEAD =
  "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]";
const COL_BODY = "px-3 py-2 align-middle text-[12px] text-[var(--text-primary)]";
const COL_NUM =
  "px-3 py-2 align-middle text-right font-mono text-[12px] text-[var(--text-primary)]";

/** A rising metric is a regression (bad); a falling one is an improvement. */
function deltaTone(delta: number): string {
  if (delta > 0) return "text-[var(--color-error,#ef4444)]";
  if (delta < 0) return "text-[var(--color-success,#10b981)]";
  return "text-[var(--text-muted)]";
}

function DeltaCell({
  delta,
  format,
}: {
  delta: number;
  format: (value: number) => string;
}) {
  const prefix = delta > 0 ? "+" : "";
  return <span className={deltaTone(delta)}>{`${prefix}${format(delta)}`}</span>;
}

function Row({ row }: { row: DeploymentImpactRow }) {
  return (
    <tr className="h-10 border-[var(--border-color)] border-t">
      <td className={COL_BODY}>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[12px] text-[var(--text-primary)]">{row.version}</span>
          {row.is_baseline && (
            <span className="rounded bg-[var(--bg-elevated,rgba(255,255,255,0.06))] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
              baseline
            </span>
          )}
        </div>
      </td>
      <td className={COL_BODY}>
        <span className="text-[var(--text-muted)]">{relativeTimeFromIso(row.deployed_at)}</span>
      </td>
      <td className={COL_NUM}>
        {row.is_baseline ? (
          <span className="text-[var(--text-muted)]">—</span>
        ) : (
          <DeltaCell delta={row.error_rate_delta} format={(v) => fmtPct(v, 2)} />
        )}
      </td>
      <td className={COL_NUM}>
        {row.is_baseline ? (
          <span className="text-[var(--text-muted)]">—</span>
        ) : (
          <DeltaCell delta={row.p95_delta} format={fmtMs} />
        )}
      </td>
    </tr>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="bg-[var(--bg-elevated,rgba(255,255,255,0.03))]">
        <th className={COL_HEAD}>Version</th>
        <th className={COL_HEAD}>Released</th>
        <th className={cn(COL_HEAD, "text-right")}>Δ Error rate</th>
        <th className={cn(COL_HEAD, "text-right")}>Δ p95</th>
      </tr>
    </thead>
  );
}

interface DeployImpactTablePanelProps {
  readonly serviceName: string;
  readonly title?: string;
}

export function DeployImpactTablePanel({
  serviceName,
  title = "Deploy impact",
}: DeployImpactTablePanelProps) {
  const { data, isPending } = useServiceDeployImpact(serviceName);
  const rows = data?.impacts ?? [];
  return (
    <PanelCard
      title={title}
      subtitle={rows.length > 0 ? `${rows.length} versions · before vs after` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No deploy impact in selected range."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <TableHeader />
            <tbody>
              {rows.map((row) => (
                <Row key={`${row.version}::${row.environment}`} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}
