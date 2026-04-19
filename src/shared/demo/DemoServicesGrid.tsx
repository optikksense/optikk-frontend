import { HealthIndicator } from "@shared/components/ui/cards";
import { formatNumber } from "@shared/utils/formatters";

import { DEMO_SERVICE_ROWS, type DemoServiceRow } from "./fixtures";

interface DemoServicesGridProps {
  readonly limit?: number;
  readonly columns?: number;
}

function Cell({ row }: { row: DemoServiceRow }) {
  const errorTone = row.errorRate > 1 ? "#F04438" : "var(--text-muted)";
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-center">
      <HealthIndicator status={row.status} size={8} />
      <div className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] text-[var(--text-primary)]">
        {row.name}
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
        {formatNumber(row.requestCount)} req
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: errorTone }}>
        {row.errorRate.toFixed(2)}% err
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
        p95 {row.p95Latency}ms
      </div>
    </div>
  );
}

export default function DemoServicesGrid({ limit, columns }: DemoServicesGridProps) {
  const rows = limit ? DEMO_SERVICE_ROWS.slice(0, limit) : DEMO_SERVICE_ROWS;
  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : { gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" };

  return (
    <div className="grid gap-2" style={gridStyle}>
      {rows.map((row) => (
        <Cell key={row.name} row={row} />
      ))}
    </div>
  );
}
