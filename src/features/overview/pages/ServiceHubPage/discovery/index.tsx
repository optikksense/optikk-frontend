import { useMemo, useState } from "react";

import { Badge, Input, SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import {
  type DiscoveryHealth,
  type DiscoveryServiceRow,
  fetchDiscoveryRows,
} from "./api";

const HEALTH_ORDER: DiscoveryHealth[] = ["healthy", "degraded", "unhealthy"];

const HEALTH_VARIANT: Record<DiscoveryHealth, "success" | "warning" | "error"> = {
  healthy: "success",
  degraded: "warning",
  unhealthy: "error",
};

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1000) return value.toLocaleString();
  return value.toString();
}

function formatMs(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${value.toFixed(0)}ms`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

export default function DiscoveryView(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | DiscoveryHealth>("all");

  const query = useTimeRangeQuery("services-discovery", async (teamId, startTime, endTime) => {
    return fetchDiscoveryRows(teamId, startTime, endTime);
  });

  const rows = query.data ?? [];

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return rows.filter((row) => {
      if (healthFilter !== "all" && row.health !== healthFilter) return false;
      if (needle && !row.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, filter, healthFilter]);

  const openService = (row: DiscoveryServiceRow): void => {
    const drawerData = JSON.stringify({
      service_name: row.name,
      request_count: row.requestCount,
      error_count: row.errorCount,
      error_rate: row.errorRate,
      avg_latency: row.avgLatency,
      p95_latency: row.p95Latency,
      p99_latency: row.p99Latency,
    });
    const next = new URLSearchParams(searchParams);
    next.set("drawerEntity", "service");
    next.set("drawerId", row.name);
    next.set("drawerTitle", row.name);
    next.set("drawerData", drawerData);
    setSearchParams(next, { replace: true });
  };

  const columns: SimpleTableColumn<DiscoveryServiceRow>[] = [
    {
      title: "Service",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_v, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.name}</span>
      ),
    },
    {
      title: "Health",
      dataIndex: "health",
      align: "center",
      width: 110,
      sorter: (a, b) => HEALTH_ORDER.indexOf(a.health) - HEALTH_ORDER.indexOf(b.health),
      render: (_v, row) => (
        <Badge variant={HEALTH_VARIANT[row.health]}>{row.health}</Badge>
      ),
    },
    {
      title: "Requests",
      dataIndex: "requestCount",
      align: "right",
      width: 110,
      sorter: (a, b) => a.requestCount - b.requestCount,
      render: (_v, row) => formatNumber(row.requestCount),
    },
    {
      title: "Err %",
      dataIndex: "errorRate",
      align: "right",
      width: 100,
      sorter: (a, b) => a.errorRate - b.errorRate,
      render: (_v, row) => formatPercent(row.errorRate),
    },
    {
      title: "p50",
      dataIndex: "p50Latency",
      align: "right",
      width: 90,
      sorter: (a, b) => a.p50Latency - b.p50Latency,
      render: (_v, row) => formatMs(row.p50Latency),
    },
    {
      title: "p95",
      dataIndex: "p95Latency",
      align: "right",
      width: 90,
      sorter: (a, b) => a.p95Latency - b.p95Latency,
      render: (_v, row) => formatMs(row.p95Latency),
    },
    {
      title: "p99",
      dataIndex: "p99Latency",
      align: "right",
      width: 90,
      sorter: (a, b) => a.p99Latency - b.p99Latency,
      render: (_v, row) => formatMs(row.p99Latency),
    },
    {
      title: "Upstream",
      dataIndex: "upstreamCount",
      align: "right",
      width: 100,
      sorter: (a, b) => a.upstreamCount - b.upstreamCount,
      render: (_v, row) => row.upstreamCount.toString(),
    },
    {
      title: "Downstream",
      dataIndex: "downstreamCount",
      align: "right",
      width: 110,
      sorter: (a, b) => a.downstreamCount - b.downstreamCount,
      render: (_v, row) => row.downstreamCount.toString(),
    },
  ];

  const healthChips: Array<{ key: "all" | DiscoveryHealth; label: string }> = [
    { key: "all", label: "All" },
    { key: "healthy", label: "Healthy" },
    { key: "degraded", label: "Degraded" },
    { key: "unhealthy", label: "Unhealthy" },
  ];

  const isEmpty = !query.isLoading && filtered.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search services…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-1">
          {healthChips.map((chip) => {
            const active = healthFilter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setHealthFilter(chip.key)}
                className={
                  "rounded-full border px-3 py-1 text-[12px] transition-colors " +
                  (active
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")
                }
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto text-[12px] text-[var(--text-muted)]">
          {filtered.length} of {rows.length} services
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex h-40 items-center justify-center text-[13px] text-[var(--text-muted)]">
          Loading services…
        </div>
      ) : query.isError ? (
        <div className="flex h-40 items-center justify-center text-[13px] text-[var(--color-error)]">
          Failed to load services.
        </div>
      ) : isEmpty ? (
        <div className="flex h-40 items-center justify-center text-[13px] text-[var(--text-muted)]">
          No services match the current filters.
        </div>
      ) : (
        <SimpleTable<DiscoveryServiceRow>
          columns={columns}
          dataSource={filtered}
          rowKey="name"
          size="middle"
          pagination={false}
          onRow={(record) => ({
            onClick: () => openService(record),
            style: { cursor: "pointer" },
          })}
        />
      )}
    </div>
  );
}
