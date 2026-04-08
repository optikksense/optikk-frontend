import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { Activity, Boxes, GitBranch, Network, Search, Server, X } from "lucide-react";
import { type ReactNode, Suspense, lazy, useMemo } from "react";

import { Badge, Card, Input } from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";
import { fetchDiscoveryRows } from "./discovery/api";

const DiscoveryView = lazy(() => import("./discovery"));
const TopologyView = lazy(() => import("./TopologyView"));

const TAB_DISCOVERY = "discovery";
const TAB_TOPOLOGY = "topology";
const RECENT_DEPLOYMENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function SummaryTile({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const toneClasses =
    tone === "success"
      ? "border-[rgba(115,201,145,0.2)] bg-[rgba(115,201,145,0.08)]"
      : tone === "warning"
        ? "border-[rgba(247,144,9,0.2)] bg-[rgba(247,144,9,0.08)]"
        : tone === "danger"
          ? "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.08)]"
          : tone === "info"
            ? "border-[rgba(124,127,242,0.22)] bg-[rgba(124,127,242,0.1)]"
            : "border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]";

  return (
    <Card padding="lg" className={`min-h-[108px] ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            {label}
          </div>
          <div className="mt-3 font-semibold text-[28px] text-[var(--text-primary)] leading-none">
            {value}
          </div>
        </div>
        <div className="rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.04)] p-2 text-[var(--text-secondary)]">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function ServiceHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView = searchParams.get("view") === TAB_TOPOLOGY ? TAB_TOPOLOGY : TAB_DISCOVERY;
  const serviceSearch = searchParams.get("serviceSearch") ?? "";

  const discoverySummaryQuery = useTimeRangeQuery(
    "services-discovery",
    async (teamId, startTime, endTime) => fetchDiscoveryRows(teamId, startTime, endTime)
  );

  const summary = useMemo(() => {
    const rows = discoverySummaryQuery.data ?? [];
    const now = Date.now();
    const recentlyDeployed = rows.filter((row) => {
      const deployedAt = row.latestDeployment?.deployed_at;
      if (!deployedAt) return false;
      const deployedAtMs = new Date(deployedAt).getTime();
      return Number.isFinite(deployedAtMs) && now - deployedAtMs <= RECENT_DEPLOYMENT_WINDOW_MS;
    }).length;

    return {
      totalServices: rows.length,
      healthy: rows.filter((row) => row.health === "healthy").length,
      degraded: rows.filter((row) => row.health === "degraded").length,
      unhealthy: rows.filter((row) => row.health === "unhealthy").length,
      requests: rows.reduce((sum, row) => sum + row.requestCount, 0),
      recentlyDeployed,
    };
  }, [discoverySummaryQuery.data]);

  const setActiveView = (key: string): void => {
    const next = new URLSearchParams(searchParams);
    if (key === TAB_TOPOLOGY) next.set("view", TAB_TOPOLOGY);
    else next.delete("view");
    setSearchParams(next);
  };

  const setServiceSearch = (value: string): void => {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) next.set("serviceSearch", value);
    else next.delete("serviceSearch");
    setSearchParams(next, { replace: true });
  };

  return (
    <PageShell>
      <PageHeader
        title="Services"
        subtitle="Operate the service fleet with release-aware discovery, topology context, and fast drilldowns into regressions."
        icon={<Server size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{summary.totalServices} services</Badge>
            <Badge variant="warning">{summary.recentlyDeployed} recent releases</Badge>
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SummaryTile
          label="Healthy"
          value={formatNumber(summary.healthy)}
          icon={<Activity size={16} />}
          tone="success"
        />
        <SummaryTile
          label="Degraded"
          value={formatNumber(summary.degraded)}
          icon={<Activity size={16} />}
          tone="warning"
        />
        <SummaryTile
          label="Unhealthy"
          value={formatNumber(summary.unhealthy)}
          icon={<Activity size={16} />}
          tone="danger"
        />
        <SummaryTile
          label="Requests"
          value={formatNumber(summary.requests)}
          icon={<Boxes size={16} />}
          tone="default"
        />
        <SummaryTile
          label="Recent Releases"
          value={formatNumber(summary.recentlyDeployed)}
          icon={<GitBranch size={16} />}
          tone="info"
        />
      </div>

      <PageSurface
        padding="sm"
        className="bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))]"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
            {[
              { key: TAB_DISCOVERY, label: "Discovery", icon: <Server size={14} /> },
              { key: TAB_TOPOLOGY, label: "Topology", icon: <Network size={14} /> },
            ].map((tab) => {
              const active = activeView === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveView(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors ${
                    active
                      ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="-translate-y-1/2 absolute top-1/2 left-3 text-[var(--text-muted)]"
              />
              <Input
                value={serviceSearch}
                onChange={(event) => setServiceSearch(event.target.value)}
                placeholder="Search services across discovery and topology"
                className="pl-9"
              />
            </div>
            {serviceSearch ? (
              <button
                type="button"
                onClick={() => setServiceSearch("")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                aria-label="Clear service search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </PageSurface>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-[13px] text-[var(--text-muted)]">
            Loading…
          </div>
        }
      >
        {activeView === TAB_DISCOVERY ? <DiscoveryView /> : <TopologyView />}
      </Suspense>
      <DashboardEntityDrawer />
    </PageShell>
  );
}
