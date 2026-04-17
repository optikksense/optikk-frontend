import { useCallback, useMemo, useState } from "react";

import { Badge, SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
} from "@shared/utils/formatters";

import {
  buildDeploymentCompareDrawerSearch,
  buildServiceDrawerSearch,
} from "@/features/overview/components/serviceDrawerState";
import {
  type DeploymentRisk,
  type DiscoveryHealth,
  type DiscoveryServiceRow,
  getDiscoveryRows,
} from "./api";

const HEALTH_ORDER: Record<DiscoveryHealth, number> = {
  unhealthy: 0,
  degraded: 1,
  healthy: 2,
};

const HEALTH_VARIANT: Record<DiscoveryHealth, "success" | "warning" | "error"> = {
  healthy: "success",
  degraded: "warning",
  unhealthy: "error",
};

const DEPLOYMENT_RISK_VARIANT: Record<DeploymentRisk, "success" | "warning" | "error" | "default"> =
  {
    stable: "success",
    watch: "warning",
    critical: "error",
    unknown: "default",
  };

const RECENT_DEPLOYMENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type ReleaseFilter = "all" | "recent" | "older" | "missing";
type SortPreset = "recent" | "requests" | "errors" | "latency" | "health";

function isRecentDeployment(row: DiscoveryServiceRow): boolean {
  const deployedAt = row.latestDeployment?.deployed_at;
  if (!deployedAt) return false;
  const deployedAtMs = new Date(deployedAt).getTime();
  return Number.isFinite(deployedAtMs) && Date.now() - deployedAtMs <= RECENT_DEPLOYMENT_WINDOW_MS;
}

function compareRows(
  sortPreset: SortPreset,
  left: DiscoveryServiceRow,
  right: DiscoveryServiceRow
): number {
  switch (sortPreset) {
    case "requests":
      return right.requestCount - left.requestCount;
    case "errors":
      return right.errorRate - left.errorRate;
    case "latency":
      return right.p95Latency - left.p95Latency;
    case "health":
      return HEALTH_ORDER[left.health] - HEALTH_ORDER[right.health];
    default: {
      const leftRecent = isRecentDeployment(left);
      const rightRecent = isRecentDeployment(right);
      if (leftRecent !== rightRecent) return leftRecent ? -1 : 1;
      const leftDeploy = left.latestDeployment?.deployed_at
        ? new Date(left.latestDeployment.deployed_at).getTime()
        : 0;
      const rightDeploy = right.latestDeployment?.deployed_at
        ? new Date(right.latestDeployment.deployed_at).getTime()
        : 0;
      if (leftDeploy !== rightDeploy) return rightDeploy - leftDeploy;
      return right.requestCount - left.requestCount;
    }
  }
}

function DeploymentCell({
  row,
  onOpen,
}: {
  row: DiscoveryServiceRow;
  onOpen: (row: DiscoveryServiceRow) => void;
}) {
  if (!row.latestDeployment) {
    return (
      <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] border-dashed bg-[rgba(255,255,255,0.02)] px-3 py-2 text-left">
        <div className="font-medium text-[12px] text-[var(--text-secondary)]">
          No deployment metadata
        </div>
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">
          Telemetry has not reported a release version yet.
        </div>
      </div>
    );
  }

  const deployment = row.latestDeployment;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(row);
      }}
      className="w-full rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-3 py-2 text-left transition-colors hover:border-[var(--color-primary-subtle-45)] hover:bg-[var(--color-primary-subtle-08)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-[var(--text-primary)]">{deployment.version}</span>
        <Badge variant={DEPLOYMENT_RISK_VARIANT[row.deploymentRisk]}>{row.deploymentRisk}</Badge>
      </div>
      <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
        {deployment.environment || "unknown env"} • deployed{" "}
        {formatRelativeTime(deployment.deployed_at)}
      </div>
      <div className="mt-1 text-[11px] text-[var(--text-muted)]">Open release comparison</div>
    </button>
  );
}

export default function DiscoveryView(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [healthFilter, setHealthFilter] = useState<"all" | DiscoveryHealth>("all");
  const [releaseFilter, setReleaseFilter] = useState<ReleaseFilter>("all");
  const [sortPreset, setSortPreset] = useState<SortPreset>("recent");
  const filter = searchParams.get("serviceSearch") ?? "";

  const query = useTimeRangeQuery("services-discovery", async (teamId, startTime, endTime) => {
    return getDiscoveryRows(teamId, startTime, endTime);
  });

  const rows = query.data ?? [];

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return [...rows]
      .filter((row) => {
        if (healthFilter !== "all" && row.health !== healthFilter) return false;
        if (needle && !row.name.toLowerCase().includes(needle)) return false;
        if (releaseFilter === "recent" && !isRecentDeployment(row)) return false;
        if (releaseFilter === "older" && (!row.latestDeployment || isRecentDeployment(row)))
          return false;
        if (releaseFilter === "missing" && row.latestDeployment) return false;
        return true;
      })
      .sort((left, right) => compareRows(sortPreset, left, right));
  }, [rows, filter, healthFilter, releaseFilter, sortPreset]);

  const openService = useCallback((row: DiscoveryServiceRow): void => {
    const nextSearch = buildServiceDrawerSearch(searchParams.toString(), {
      name: row.name,
      requestCount: row.requestCount,
      errorCount: row.errorCount,
      errorRate: row.errorRate,
      avgLatency: row.avgLatency,
      p95Latency: row.p95Latency,
      p99Latency: row.p99Latency,
    });
    setSearchParams(new URLSearchParams(nextSearch), { replace: true });
  }, [searchParams, setSearchParams]);

  const handleServiceRowClick = useCallback(
    (record: DiscoveryServiceRow) => ({
      onClick: () => openService(record),
      style: { cursor: "pointer" } as const,
    }),
    [openService]
  );

  const openDeploymentCompare = (row: DiscoveryServiceRow): void => {
    if (!row.latestDeployment) return;
    const nextSearch = buildDeploymentCompareDrawerSearch(searchParams.toString(), {
      serviceName: row.name,
      version: row.latestDeployment.version,
      environment: row.latestDeployment.environment,
      deployedAt: row.latestDeployment.deployed_at,
      lastSeenAt: row.latestDeployment.last_seen_at,
      isActive: row.latestDeployment.is_active,
    });
    setSearchParams(new URLSearchParams(nextSearch), { replace: true });
  };

  const columns: SimpleTableColumn<DiscoveryServiceRow>[] = [
    {
      title: "Service",
      dataIndex: "name",
      key: "name",
      width: 300,
      sticky: "left",
      headerClassName: "border-r border-[var(--border-color)]",
      cellClassName: "border-r border-[var(--border-color)]",
      render: (_value, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[13px] text-[var(--text-primary)]">{row.name}</span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <span>{formatNumber(row.requestCount)} req</span>
            <span>•</span>
            <span>{formatPercentage(row.errorRate)}</span>
            <span>•</span>
            <span>{formatDuration(row.p95Latency)} p95</span>
          </div>
        </div>
      ),
    },
    {
      title: "Health",
      dataIndex: "health",
      key: "health",
      align: "center",
      width: 110,
      render: (_value, row) => <Badge variant={HEALTH_VARIANT[row.health]}>{row.health}</Badge>,
    },
    {
      title: "Requests",
      dataIndex: "requestCount",
      key: "requestCount",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.requestCount),
    },
    {
      title: "Err %",
      dataIndex: "errorRate",
      key: "errorRate",
      align: "right",
      width: 110,
      render: (_value, row) => (
        <span
          className={
            row.errorRate > 5
              ? "text-[var(--color-error)]"
              : row.errorRate > 1
                ? "text-[var(--color-warning)]"
                : "text-[var(--text-primary)]"
          }
        >
          {formatPercentage(row.errorRate)}
        </span>
      ),
    },
    {
      title: "p95",
      dataIndex: "p95Latency",
      key: "p95Latency",
      align: "right",
      width: 100,
      render: (_value, row) => formatDuration(row.p95Latency),
    },
    {
      title: "Topology",
      key: "topology",
      width: 140,
      render: (_value, row) => (
        <div className="flex flex-col gap-0.5 text-[12px] text-[var(--text-secondary)]">
          <span>{row.upstreamCount} upstream</span>
          <span>{row.downstreamCount} downstream</span>
        </div>
      ),
    },
    {
      title: "Last Deployment",
      key: "deployment",
      width: 280,
      sticky: "right",
      headerClassName: "border-l border-[var(--border-color)]",
      cellClassName: "border-l border-[var(--border-color)]",
      render: (_value, row) => <DeploymentCell row={row} onOpen={openDeploymentCompare} />,
    },
  ];

  const isEmpty = !query.isLoading && filtered.length === 0;
  const recentReleases = rows.filter((row) => isRecentDeployment(row)).length;

  return (
    <div className="flex flex-col gap-4">
      <PageSurface
        padding="lg"
        className="bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">
              Discovery
            </div>
            <h2 className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
              Release-aware service catalog
            </h2>
            <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-6">
              Scan health, latency, topology footprint, and the newest release for every service
              from one dense surface.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                Visible
              </div>
              <div className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
                {formatNumber(filtered.length)}
              </div>
            </div>
            <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                Recent Releases
              </div>
              <div className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
                {formatNumber(recentReleases)}
              </div>
            </div>
            <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                Degraded
              </div>
              <div className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
                {formatNumber(rows.filter((row) => row.health !== "healthy").length)}
              </div>
            </div>
            <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                Missing Deploy
              </div>
              <div className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
                {formatNumber(rows.filter((row) => !row.latestDeployment).length)}
              </div>
            </div>
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={healthFilter}
              onChange={(event) => setHealthFilter(event.target.value as "all" | DiscoveryHealth)}
              className="h-10 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 text-[12px] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="all">All health states</option>
              <option value="healthy">Healthy</option>
              <option value="degraded">Degraded</option>
              <option value="unhealthy">Unhealthy</option>
            </select>

            <select
              value={releaseFilter}
              onChange={(event) => setReleaseFilter(event.target.value as ReleaseFilter)}
              className="h-10 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 text-[12px] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="all">All release states</option>
              <option value="recent">Recent releases</option>
              <option value="older">Older releases</option>
              <option value="missing">No deployment metadata</option>
            </select>

            <select
              value={sortPreset}
              onChange={(event) => setSortPreset(event.target.value as SortPreset)}
              className="h-10 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 text-[12px] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="recent">Sort by release recency</option>
              <option value="requests">Sort by request volume</option>
              <option value="errors">Sort by error rate</option>
              <option value="latency">Sort by p95 latency</option>
              <option value="health">Sort by health</option>
            </select>

            <div className="ml-auto text-[12px] text-[var(--text-muted)]">
              {filtered.length} of {rows.length} services
            </div>
          </div>

          {query.isLoading ? (
            <div className="flex h-48 items-center justify-center text-[13px] text-[var(--text-muted)]">
              Loading services…
            </div>
          ) : query.isError ? (
            <div className="flex h-48 items-center justify-center text-[13px] text-[var(--color-error)]">
              Failed to load services.
            </div>
          ) : isEmpty ? (
            <div className="flex h-48 items-center justify-center text-[13px] text-[var(--text-muted)]">
              No services match the current filters.
            </div>
          ) : (
            <SimpleTable<DiscoveryServiceRow>
              columns={columns}
              dataSource={filtered}
              rowKey="name"
              size="middle"
              pagination={false}
              scroll={{ x: 1150 }}
              onRow={handleServiceRowClick}
            />
          )}
        </div>
      </PageSurface>
    </div>
  );
}
