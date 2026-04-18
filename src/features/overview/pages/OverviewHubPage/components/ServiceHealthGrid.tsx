import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import type { ServiceMetricPoint } from "@/features/metrics/types";
import { buildServiceDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { APP_COLORS } from "@config/colorLiterals";
import { HealthIndicator } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

interface ServiceHealthGridProps {
  readonly services: readonly ServiceMetricPoint[];
  readonly limit?: number;
}

type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface HealthCell {
  readonly name: string;
  readonly status: HealthStatus;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
}

function statusFrom(errorRate: number): HealthStatus {
  if (errorRate > 5) return "unhealthy";
  if (errorRate > 1) return "degraded";
  return "healthy";
}

function toCell(row: ServiceMetricPoint): HealthCell {
  const requestCount = Number(row.request_count ?? 0);
  const errorCount = Number(row.error_count ?? 0);
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  return {
    name: String(row.service_name ?? ""),
    status: statusFrom(errorRate),
    requestCount,
    errorCount,
    errorRate,
    avgLatency: Number(row.avg_latency ?? 0),
    p95Latency: Number(row.p95_latency ?? 0),
    p99Latency: Number(row.p99_latency ?? 0),
  };
}

function Cell({ cell, onOpen }: { cell: HealthCell; onOpen: () => void }) {
  const errorTone =
    cell.errorRate > 1 ? APP_COLORS.hex_f04438 : "var(--text-muted)";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="hover:-translate-y-px rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-center transition-all duration-200 hover:border-[var(--color-primary)]"
    >
      <HealthIndicator status={cell.status} size={8} />
      <div className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] text-[var(--text-primary)]">
        {cell.name}
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
        {formatNumber(cell.requestCount)} req
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: errorTone }}>
        {Math.max(0, cell.errorRate).toFixed(2)}% err
      </div>
    </button>
  );
}

export default function ServiceHealthGrid({ services, limit = 8 }: ServiceHealthGridProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const cells = useMemo(
    () => services.slice(0, limit).map(toCell).filter((cell) => cell.name),
    [services, limit]
  );

  if (cells.length === 0) {
    return (
      <div className="py-6 text-center text-[12px] text-[var(--text-muted)]">
        No services to rank.
      </div>
    );
  }

  const openService = (cell: HealthCell): void => {
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
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
    >
      {cells.map((cell) => (
        <Cell key={cell.name} cell={cell} onOpen={() => openService(cell)} />
      ))}
    </div>
  );
}
