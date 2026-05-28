import { useLocation, useNavigate } from "@tanstack/react-router";

import { Surface } from "@/components/ui";
import { buildServiceDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { formatNumber } from "@shared/utils/formatters";

import type { ServiceHealthCell, ServiceHealthStatus } from "../hooks/useOverviewModel";

interface Props {
  readonly cells: readonly ServiceHealthCell[];
  readonly limit?: number;
}

const STATUS_TINT: Record<ServiceHealthStatus, string> = {
  ok: "var(--color-healthy)",
  warn: "var(--color-degraded)",
  err: "var(--color-critical)",
};

function rateLabel(req: number): string {
  return req >= 1000 ? `${(req / 1000).toFixed(1)}k` : formatNumber(req);
}

function Tile({ cell, onOpen }: { readonly cell: ServiceHealthCell; readonly onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-[72px] flex-col justify-between rounded-md px-2.5 py-2 text-left text-white transition-opacity hover:opacity-90"
      style={{ background: STATUS_TINT[cell.status] }}
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono font-semibold text-[11px] opacity-95">
        {cell.name}
      </span>
      <span className="flex flex-col">
        <span className="font-mono font-bold text-[13px] leading-none">
          {rateLabel(cell.requestCount)}
        </span>
        <span className="font-mono text-[10px] opacity-90">
          {cell.errorRate.toFixed(2)}% · {Math.round(cell.p99Latency)}ms
        </span>
      </span>
    </button>
  );
}

function StatusLegend({ cells }: { readonly cells: readonly ServiceHealthCell[] }) {
  const counts = cells.reduce(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { ok: 0, warn: 0, err: 0 } as Record<ServiceHealthStatus, number>
  );
  return (
    <div className="flex items-center gap-3 text-[10.5px] text-[var(--text-muted)]">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm" style={{ background: STATUS_TINT.ok }} />
        {counts.ok}
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm" style={{ background: STATUS_TINT.warn }} />
        {counts.warn}
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm" style={{ background: STATUS_TINT.err }} />
        {counts.err}
      </span>
    </div>
  );
}

export default function ServiceHealthGrid({ cells, limit = 15 }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const visible = cells.slice(0, limit);

  const open = (cell: ServiceHealthCell): void => {
    const search = buildServiceDrawerSearch(location.search, {
      name: cell.name,
      requestCount: cell.requestCount,
      errorCount: cell.errorCount,
      errorRate: cell.errorRate,
      avgLatency: cell.avgLatency,
      p95Latency: cell.p95Latency,
      p99Latency: cell.p99Latency,
    });
    navigate({ to: location.pathname + search });
  };

  return (
    <Surface elevation={1} padding="md" className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-semibold text-[13px] text-[var(--text-primary)]">
            Service health
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {cells.length} services · click any tile to inspect
          </div>
        </div>
        <StatusLegend cells={cells} />
      </div>

      {visible.length === 0 ? (
        <div className="py-8 text-center text-[12px] text-[var(--text-muted)]">
          No services in the selected range
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((cell) => (
            <Tile key={cell.name} cell={cell} onOpen={() => open(cell)} />
          ))}
        </div>
      )}
    </Surface>
  );
}
