import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { Activity, Cable, Database, FileText, Layers3, TimerReset } from "lucide-react";

import {
  Badge,
  Button,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatTimestamp,
} from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import {
  type DatastoreConnectionRow,
  type DatastoreErrorRow,
  type DatastoreNamespaceRow,
  type DatastoreOperationRow,
  type DatastoreServerRow,
  type SlowQueryPattern,
  saturationApi,
} from "../../api/saturationApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";
import {
  buildSaturationLogsSearch,
  buildSaturationTracesSearch,
} from "../../components/navigation";

function categoryBadgeVariant(category: string): "info" | "warning" {
  return category === "redis" ? "warning" : "info";
}

export default function DatastoreDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const system = decodeURIComponent(typeof params.system === "string" ? params.system : "");

  const overviewQuery = useTimeRangeQuery(
    "saturation-datastore-overview",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreOverview(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const serversQuery = useTimeRangeQuery(
    "saturation-datastore-servers",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreServers(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const namespacesQuery = useTimeRangeQuery(
    "saturation-datastore-namespaces",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreNamespaces(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const operationsQuery = useTimeRangeQuery(
    "saturation-datastore-operations",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreOperations(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const errorsQuery = useTimeRangeQuery(
    "saturation-datastore-errors",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreErrors(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const connectionsQuery = useTimeRangeQuery(
    "saturation-datastore-connections",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreConnections(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const slowQueriesQuery = useTimeRangeQuery(
    "saturation-datastore-slow-queries",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreSlowQueries(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );

  const openSurface = (target: "logs" | "traces") => {
    const filters: StructuredFilter[] =
      target === "logs"
        ? [{ field: "db.system", operator: "equals", value: system }]
        : [{ field: "db_system", operator: "equals", value: system }];
    const search =
      target === "logs"
        ? buildSaturationLogsSearch(location.search, filters)
        : buildSaturationTracesSearch(location.search, filters);
    navigate(dynamicNavigateOptions(
      target === "logs" ? ROUTES.logs : ROUTES.traces,
      search,
    ));
  };

  const serverColumns: SimpleTableColumn<DatastoreServerRow>[] = [
    {
      title: "Server",
      key: "server",
      width: 280,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.server}</span>
      ),
    },
    {
      title: "p50",
      key: "p50_ms",
      align: "right",
      width: 100,
      render: (_value, row) => formatDuration(row.p50_ms),
    },
    {
      title: "p95",
      key: "p95_ms",
      align: "right",
      width: 100,
      render: (_value, row) => formatDuration(row.p95_ms),
    },
    {
      title: "p99",
      key: "p99_ms",
      align: "right",
      width: 100,
      render: (_value, row) => formatDuration(row.p99_ms),
    },
  ];

  const namespaceColumns: SimpleTableColumn<DatastoreNamespaceRow>[] = [
    {
      title: "Namespace",
      key: "namespace",
      width: 280,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.namespace || "—"}</span>
      ),
    },
    {
      title: "Spans",
      key: "span_count",
      align: "right",
      width: 120,
      render: (_value, row) => formatNumber(row.span_count),
    },
  ];

  const operationColumns: SimpleTableColumn<DatastoreOperationRow>[] = [
    {
      title: "Operation",
      key: "operation",
      width: 240,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.operation || "unknown"}</span>
      ),
    },
    {
      title: "Ops/s",
      key: "ops_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.ops_per_sec),
    },
    {
      title: "p95",
      key: "p95_ms",
      align: "right",
      width: 110,
      render: (_value, row) => formatDuration(row.p95_ms),
    },
    {
      title: "Err/s",
      key: "errors_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.errors_per_sec),
    },
  ];

  const errorColumns: SimpleTableColumn<DatastoreErrorRow>[] = [
    {
      title: "Error Type",
      key: "error_type",
      width: 300,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {row.error_type || "unknown"}
        </span>
      ),
    },
    {
      title: "Err/s",
      key: "errors_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.errors_per_sec),
    },
  ];

  const connectionColumns: SimpleTableColumn<DatastoreConnectionRow>[] = [
    {
      title: "Pool",
      key: "pool_name",
      width: 220,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.pool_name || "default"}</span>
      ),
    },
    {
      title: "Used",
      key: "used_connections",
      align: "right",
      width: 90,
      render: (_value, row) => formatNumber(row.used_connections),
    },
    {
      title: "Util %",
      key: "util_pct",
      align: "right",
      width: 90,
      render: (_value, row) => formatPercentage(row.util_pct),
    },
    {
      title: "Pending",
      key: "pending_requests",
      align: "right",
      width: 90,
      render: (_value, row) => formatNumber(row.pending_requests),
    },
    {
      title: "Timeout/s",
      key: "timeout_rate",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.timeout_rate),
    },
    {
      title: "Wait p95",
      key: "p95_wait_ms",
      align: "right",
      width: 100,
      render: (_value, row) => formatDuration(row.p95_wait_ms),
    },
  ];

  const slowQueryColumns: SimpleTableColumn<SlowQueryPattern>[] = [
    {
      title: "Query / Command",
      key: "query_text",
      width: 520,
      render: (_value, row) => (
        <div className="flex flex-col gap-1">
          <span className="line-clamp-2 font-medium text-[var(--text-primary)]">
            {row.query_text || "No query text"}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {row.collection_name ? `Collection ${row.collection_name}` : "Command-level telemetry"}
          </span>
        </div>
      ),
    },
    {
      title: "p95",
      key: "p95_ms",
      align: "right",
      width: 110,
      render: (_value, row) => formatDuration(row.p95_ms),
    },
    {
      title: "Calls",
      key: "call_count",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.call_count),
    },
    {
      title: "Errors",
      key: "error_count",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.error_count),
    },
  ];

  const overview = overviewQuery.data;
  const topCollections = overview?.top_collections ?? [];

  return (
    <PageShell>
      <PageHeader
        title={system}
        subtitle="System-level datastore exploration with latency, contention, namespace, and slow-query context."
        icon={<Database size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={categoryBadgeVariant(overview?.category ?? "database")}>
              {overview?.category ?? "database"}
            </Badge>
            <Button size="sm" variant="secondary" onClick={() => openSurface("logs")}>
              Logs
            </Button>
            <Button size="sm" variant="secondary" onClick={() => openSurface("traces")}>
              Traces
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SaturationStatTile
          label="Queries"
          value={formatNumber(overview?.query_count ?? 0)}
          meta="Total operations in range"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Err %"
          value={formatPercentage(overview?.error_rate ?? 0)}
          meta="System-wide error rate"
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="P95"
          value={formatDuration(overview?.p95_latency_ms ?? 0)}
          meta={`P99 ${formatDuration(overview?.p99_latency_ms ?? 0)}`}
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="Connections"
          value={formatNumber(overview?.active_connections ?? 0)}
          meta="Active pool usage"
          icon={<Cable size={16} />}
        />
        <SaturationStatTile
          label="Namespaces"
          value={formatNumber(overview?.namespace_count ?? 0)}
          meta={`Collections ${formatNumber(overview?.collection_count ?? 0)}`}
          icon={<Layers3 size={16} />}
        />
        <SaturationStatTile
          label="Read/Write"
          value={`${formatNumber(overview?.read_ops_per_sec ?? 0)}/${formatNumber(overview?.write_ops_per_sec ?? 0)}`}
          meta="Read ops per sec / write ops per sec"
          icon={<FileText size={16} />}
        />
      </div>

      <PageSurface padding="lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Overview
            </div>
            <h2 className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
              Top collections and primary endpoint
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] text-[var(--text-secondary)] leading-6">
              Use this system page to follow the highest-latency collections, the dominant server
              endpoint, and the most likely contention sources.
            </p>
          </div>
          <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[12px] text-[var(--text-secondary)]">
            <div className="font-medium text-[var(--text-primary)]">Primary endpoint</div>
            <div className="mt-1">{overview?.top_server || "No server address detected"}</div>
            <div className="mt-2">
              Cache hit rate{" "}
              {overview?.cache_hit_rate != null ? formatPercentage(overview.cache_hit_rate) : "n/a"}
            </div>
          </div>
        </div>
        {topCollections.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topCollections.map((collection) => (
              <div
                key={collection.collection_name}
                className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
              >
                <div className="font-medium text-[var(--text-primary)]">
                  {collection.collection_name}
                </div>
                <div className="mt-2 text-[12px] text-[var(--text-secondary)]">
                  {formatDuration(collection.p99_ms)} p99 • {formatNumber(collection.ops_per_sec)}{" "}
                  ops/s
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </PageSurface>

      <div className="grid gap-4 xl:grid-cols-2">
        <PageSurface padding="lg">
          <div className="mb-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Servers
            </div>
            <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
              Instance latency
            </div>
          </div>
          <SimpleTable
            dataSource={serversQuery.data ?? []}
            columns={serverColumns}
            rowKey={(row) => row.server}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 640 }}
          />
        </PageSurface>

        <PageSurface padding="lg">
          <div className="mb-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Namespaces
            </div>
            <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
              Active namespaces / collections
            </div>
          </div>
          <SimpleTable
            dataSource={namespacesQuery.data ?? []}
            columns={namespaceColumns}
            rowKey={(row) => row.namespace}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 480 }}
          />
        </PageSurface>
      </div>

      <PageSurface padding="lg">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Operations
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Latency and throughput by operation
          </div>
        </div>
        <SimpleTable
          dataSource={operationsQuery.data ?? []}
          columns={operationColumns}
          rowKey={(row) => row.operation}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 820 }}
        />
      </PageSurface>

      <div className="grid gap-4 xl:grid-cols-2">
        <PageSurface padding="lg">
          <div className="mb-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Errors
            </div>
            <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
              Error pressure by type
            </div>
          </div>
          <SimpleTable
            dataSource={errorsQuery.data ?? []}
            columns={errorColumns}
            rowKey={(row) => row.error_type}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 480 }}
          />
        </PageSurface>

        <PageSurface padding="lg">
          <div className="mb-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Connections
            </div>
            <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
              Pool utilization
            </div>
          </div>
          <SimpleTable
            dataSource={connectionsQuery.data ?? []}
            columns={connectionColumns}
            rowKey={(row) => row.pool_name}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 760 }}
          />
        </PageSurface>
      </div>

      <PageSurface padding="lg">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Slow Queries
            </div>
            <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
              Highest-latency query patterns
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Updated {formatTimestamp(Date.now())}
          </div>
        </div>
        <SimpleTable
          dataSource={slowQueriesQuery.data ?? []}
          columns={slowQueryColumns}
          rowKey={(row, index) => `${row.collection_name}-${index}`}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 980 }}
        />
      </PageSurface>
    </PageShell>
  );
}
