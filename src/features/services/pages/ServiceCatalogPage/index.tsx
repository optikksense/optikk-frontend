import { useNavigate } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { useMemo, useState } from "react";

import {
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { getTopology } from "../../api/serviceCatalogApi";
import type { ServiceNode } from "../../api/serviceCatalogApi";

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function HealthDot({ health }: { health: string }) {
  const color =
    health === "healthy"
      ? "#10b981"
      : health === "degraded"
        ? "#f59e0b"
        : health === "unhealthy"
          ? "#ef4444"
          : "#6b7280";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
}

const columns: SimpleTableColumn<ServiceNode>[] = [
  {
    title: "",
    key: "health",
    width: 32,
    render: (_v, row) => <HealthDot health={row.health} />,
  },
  {
    title: "Service",
    key: "name",
    width: 240,
    render: (_v, row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.name}</span>
    ),
  },
  {
    title: "Requests",
    key: "request_count",
    width: 120,
    align: "right",
    sorter: (a, b) => a.request_count - b.request_count,
    defaultSortOrder: "descend",
    render: (_v, row) => formatNumber(row.request_count),
  },
  {
    title: "Errors",
    key: "error_count",
    width: 100,
    align: "right",
    sorter: (a, b) => a.error_count - b.error_count,
    render: (_v, row) => formatNumber(row.error_count),
  },
  {
    title: "Error %",
    key: "error_rate",
    width: 100,
    align: "right",
    sorter: (a, b) => a.error_rate - b.error_rate,
    render: (_v, row) => `${(row.error_rate * 100).toFixed(2)}%`,
  },
  {
    title: "p50",
    key: "p50_latency_ms",
    width: 90,
    align: "right",
    sorter: (a, b) => a.p50_latency_ms - b.p50_latency_ms,
    render: (_v, row) => fmtMs(row.p50_latency_ms),
  },
  {
    title: "p95",
    key: "p95_latency_ms",
    width: 90,
    align: "right",
    sorter: (a, b) => a.p95_latency_ms - b.p95_latency_ms,
    render: (_v, row) => fmtMs(row.p95_latency_ms),
  },
  {
    title: "p99",
    key: "p99_latency_ms",
    width: 90,
    align: "right",
    sorter: (a, b) => a.p99_latency_ms - b.p99_latency_ms,
    render: (_v, row) => fmtMs(row.p99_latency_ms),
  },
];

function FilterBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="Filter services…"
        className="rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[12px] text-[var(--text-primary)] focus:outline-none"
        style={{ minWidth: 200 }}
      />
    </div>
  );
}

export default function ServiceCatalogPage(): JSX.Element {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const topologyQ = useTimeRangeQuery("service-catalog-topology", (_t, s, e) =>
    getTopology(Number(s), Number(e))
  );

  const rows = useMemo(() => {
    const all = topologyQ.data?.nodes ?? [];
    if (!filter) return all;
    const f = filter.toLowerCase();
    return all.filter((n) => n.name.toLowerCase().includes(f));
  }, [topologyQ.data, filter]);

  return (
    <PageShell>
      <PageHeader
        title="Service catalog"
        subtitle="Every service emitting telemetry, with RED metrics and health status."
        icon={<Server size={24} />}
        actions={<FilterBar value={filter} onChange={setFilter} />}
      />

      {topologyQ.error ? (
        <div
          className="rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-red-300 text-sm"
          role="alert"
        >
          Could not load services: {(topologyQ.error as Error).message}
        </div>
      ) : null}

      <PageSurface padding="lg">
        <SimpleTable
          columns={columns}
          dataSource={rows}
          rowKey={(r) => r.name}
          pagination={{ pageSize: 50 }}
          onRow={(record) => ({
            onClick: () =>
              navigate({ to: `/services/${encodeURIComponent(record.name)}` }),
            style: { cursor: "pointer" },
          })}
        />
      </PageSurface>
    </PageShell>
  );
}
