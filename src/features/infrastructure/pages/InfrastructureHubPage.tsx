import { Suspense, lazy, useMemo } from "react";

import { PageShell } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getNodesSummary } from "../api/hostsApi";
import { INFRA_TAB, type InfraTabId, URL_TAB } from "../constants";
import type { InfrastructureNodeSummary } from "../types";
import { InfrastructureHubHeader } from "./InfrastructureHubHeader";
import { InfrastructureKpiStrip } from "./InfrastructureKpiStrip";

const HostsTab = lazy(() => import("./tabs/HostsTab"));
const ContainersTab = lazy(() => import("./tabs/ContainersTab"));
const NetworkTab = lazy(() => import("./tabs/NetworkTab"));
const FleetTab = lazy(() => import("./tabs/FleetTab"));

const TAB_ITEMS: { id: InfraTabId; label: string }[] = [
  { id: INFRA_TAB.hosts, label: "Hosts" },
  { id: INFRA_TAB.containers, label: "Containers" },
  { id: INFRA_TAB.network, label: "Network" },
  { id: INFRA_TAB.hostMap, label: "Host map" },
];

function parseTab(raw: string | null): InfraTabId {
  const allowed = TAB_ITEMS.map((t) => t.id);
  if (raw && (allowed as string[]).includes(raw)) return raw as InfraTabId;
  return INFRA_TAB.hosts;
}

function useNodesSummary() {
  return useTimeRangeQuery<InfrastructureNodeSummary>(
    "infrastructure.nodes-summary",
    (_team, s, e) => getNodesSummary(s, e)
  );
}

function tabCount(id: InfraTabId, hostCount: number | null, podCount: number | null): number | null {
  if (id === INFRA_TAB.hosts) return hostCount;
  if (id === INFRA_TAB.containers) return podCount;
  return null;
}

function TabsRow({
  active,
  hostCount,
  podCount,
  onChange,
}: {
  active: InfraTabId;
  hostCount: number | null;
  podCount: number | null;
  onChange: (next: InfraTabId) => void;
}) {
  return (
    <nav className="flex border-border border-b">
      {TAB_ITEMS.map((tab) => {
        const isActive = active === tab.id;
        const count = tabCount(tab.id, hostCount, podCount);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1 border-b-2 px-3 py-2 text-[13px] transition-colors ${
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {count != null && (
              <span className="ml-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-muted px-1 text-[10px] text-foreground-muted">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default function InfrastructureHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const summaryQ = useNodesSummary();
  const summary = summaryQ.data;
  const activeTab = useMemo(() => parseTab(searchParams.get(URL_TAB)), [searchParams]);

  const setTab = (id: InfraTabId) => {
    const next = new URLSearchParams(searchParams);
    if (id === INFRA_TAB.hosts) next.delete(URL_TAB);
    else next.set(URL_TAB, id);
    setSearchParams(next, { replace: true });
  };

  const hostCount =
    summary != null
      ? summary.healthy_nodes + summary.degraded_nodes + summary.unhealthy_nodes
      : null;
  const podCount = summary?.total_pods ?? null;
  const alertCount = summary?.unhealthy_nodes ?? null;

  return (
    <PageShell>
      <InfrastructureHubHeader
        hostCount={hostCount}
        podCount={podCount}
        alertCount={alertCount}
      />
      <InfrastructureKpiStrip summary={summary} />
      <TabsRow
        active={activeTab}
        hostCount={hostCount}
        podCount={podCount}
        onChange={setTab}
      />
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-[13px] text-foreground-muted">
            Loading…
          </div>
        }
      >
        {activeTab === INFRA_TAB.hosts ? <HostsTab /> : null}
        {activeTab === INFRA_TAB.containers ? <ContainersTab /> : null}
        {activeTab === INFRA_TAB.network ? <NetworkTab /> : null}
        {activeTab === INFRA_TAB.hostMap ? <FleetTab /> : null}
      </Suspense>
      <DashboardEntityDrawer />
    </PageShell>
  );
}
