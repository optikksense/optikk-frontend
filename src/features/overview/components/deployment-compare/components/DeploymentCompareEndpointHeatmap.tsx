import { memo, useMemo } from "react";

import type { DeploymentCompareResponse } from "@shared/api/deployments/deploymentsApi";
import { Card } from "@shared/components/primitives/ui";
import { formatDuration } from "@shared/utils/formatters";

interface Props {
  readonly compare: DeploymentCompareResponse;
}

type EndpointRow = DeploymentCompareResponse["top_endpoints"][number];

function topRowsByBefore(endpoints: readonly EndpointRow[], limit = 8): EndpointRow[] {
  return [...endpoints]
    .filter((row) => row.before_p95_ms > 0 || row.after_p95_ms > 0)
    .sort((left, right) => right.after_p95_ms - left.after_p95_ms)
    .slice(0, limit);
}

function heatTone(msValue: number, max: number): string {
  if (max <= 0) return "rgba(255,255,255,0.04)";
  const ratio = Math.min(1, Math.max(0, msValue / max));
  const alpha = 0.08 + ratio * 0.35;
  return `rgba(240,68,56,${alpha.toFixed(2)})`;
}

function HeatCell({ value, max }: { value: number; max: number }) {
  return (
    <div
      style={{ backgroundColor: heatTone(value, max) }}
      className="flex min-w-[72px] items-center justify-center rounded-[var(--card-radius)] border border-[var(--border-color)] px-2 py-1 font-mono text-[11px] text-[var(--text-primary)]"
    >
      {formatDuration(value)}
    </div>
  );
}

function EndpointRow({ row, max }: { row: EndpointRow; max: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 py-1">
      <div className="min-w-0 truncate text-[12px] text-[var(--text-primary)]">
        {row.endpoint_name || row.operation_name}
        <span className="ml-2 text-[11px] text-[var(--text-muted)]">{row.http_method || ""}</span>
      </div>
      <HeatCell value={row.before_p95_ms} max={max} />
      <HeatCell value={row.after_p95_ms} max={max} />
    </div>
  );
}

function DeploymentCompareEndpointHeatmapComponent({ compare }: Props) {
  const rows = useMemo(() => topRowsByBefore(compare.top_endpoints), [compare.top_endpoints]);
  const max = useMemo(
    () => rows.reduce((acc, row) => Math.max(acc, row.before_p95_ms, row.after_p95_ms), 0),
    [rows]
  );

  if (rows.length === 0) return null;

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-3">
        <h3 className="m-0 font-semibold text-[var(--text-primary)]">p95 heatmap by endpoint</h3>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Top endpoints by post-deploy p95. Darker red = slower.
        </p>
      </div>
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        <span>Endpoint</span>
        <span className="text-right">Before</span>
        <span className="text-right">After</span>
      </div>
      <div className="flex flex-col divide-y divide-[var(--border-color)]">
        {rows.map((row) => (
          <EndpointRow
            key={`${row.http_method}:${row.endpoint_name}:${row.operation_name}`}
            row={row}
            max={max}
          />
        ))}
      </div>
    </Card>
  );
}

export const DeploymentCompareEndpointHeatmap = memo(DeploymentCompareEndpointHeatmapComponent);
