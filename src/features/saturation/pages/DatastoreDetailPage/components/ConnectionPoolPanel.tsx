import { memo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { Card, SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { ConnectionLimits } from "@/features/saturation/api/databaseConnectionsApi";
import type { LatencyPercentileSeries } from "@/features/saturation/series/aggregateLatencyByTimestamp";

import { useDatastoreConnectionPool } from "../hooks/useDatastoreConnectionPool";
import { GroupedSeriesPanel } from "./GroupedSeriesPanel";

const LIMIT_COLUMNS: SimpleTableColumn<ConnectionLimits>[] = [
  {
    title: "Pool",
    key: "pool_name",
    width: 220,
    render: (_v, row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.pool_name || "default"}</span>
    ),
  },
  {
    title: "Max",
    key: "max",
    align: "right",
    width: 100,
    render: (_v, row) => formatNumber(row.max ?? 0),
  },
  {
    title: "Idle max",
    key: "idle_max",
    align: "right",
    width: 100,
    render: (_v, row) => formatNumber(row.idle_max ?? 0),
  },
  {
    title: "Idle min",
    key: "idle_min",
    align: "right",
    width: 100,
    render: (_v, row) => formatNumber(row.idle_min ?? 0),
  },
];

function LatencyP95Panel({
  eyebrow,
  title,
  series,
  emptyLabel,
}: {
  eyebrow: string;
  title: string;
  series: LatencyPercentileSeries;
  emptyLabel: string;
}) {
  return (
    <Card padding="lg" className="min-h-[300px] border-[var(--border-color)]">
      <div className="mb-3">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          {eyebrow}
        </div>
        <div className="mt-1 font-semibold text-[15px] text-[var(--text-primary)]">{title}</div>
      </div>
      {series.timestamps.length === 0 ? (
        <div className="grid h-[220px] place-items-center text-[12px] text-[var(--text-muted)]">
          {emptyLabel}
        </div>
      ) : (
        <ObservabilityChart
          timestamps={series.timestamps}
          series={[
            { label: "p50", values: series.p50, color: "var(--color-info,#3b82f6)" },
            { label: "p95", values: series.p95, color: "var(--color-warning,#f59e0b)" },
            { label: "p99", values: series.p99, color: "var(--color-error,#ef4444)" },
          ]}
          height={240}
          legend
          yFormatter={(v) => formatDuration(v)}
        />
      )}
    </Card>
  );
}

function ConnectionPoolPanelComponent({ system }: { system: string }) {
  const pool = useDatastoreConnectionPool(system);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <GroupedSeriesPanel
          eyebrow="Connections"
          title="Pool utilization"
          result={pool.utilization}
          emptyLabel="No connection-pool utilization in this window."
          yFormatter={(v) => formatPercentage(v, 1)}
        />
        <GroupedSeriesPanel
          eyebrow="Connections"
          title="Pending acquisitions"
          result={pool.pending}
          emptyLabel="No pending connection requests in this window."
          yFormatter={(v) => formatNumber(v)}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <LatencyP95Panel
          eyebrow="Latency"
          title="Acquire wait time"
          series={pool.waitTime}
          emptyLabel="No connection wait-time samples."
        />
        <LatencyP95Panel
          eyebrow="Latency"
          title="Create time"
          series={pool.createTime}
          emptyLabel="No connection create-time samples."
        />
        <LatencyP95Panel
          eyebrow="Latency"
          title="Use time"
          series={pool.useTime}
          emptyLabel="No connection use-time samples."
        />
      </div>
      <Card padding="lg" className="border-[var(--border-color)]">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Connections
          </div>
          <div className="mt-1 font-semibold text-[15px] text-[var(--text-primary)]">
            Pool limits
          </div>
        </div>
        <SimpleTable
          dataSource={pool.limits}
          columns={LIMIT_COLUMNS}
          rowKey={(row) => row.pool_name}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 520 }}
        />
      </Card>
    </div>
  );
}

export const ConnectionPoolPanel = memo(ConnectionPoolPanelComponent);
