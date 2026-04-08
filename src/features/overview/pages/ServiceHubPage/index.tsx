import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { Server } from "lucide-react";
import { Suspense, lazy } from "react";

import { Tabs } from "@shared/components/primitives/ui";
import { PageHeader, PageShell } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";

const DiscoveryView = lazy(() => import("./discovery"));
const TopologyView = lazy(() => import("./TopologyView"));

const TAB_DISCOVERY = "discovery";
const TAB_TOPOLOGY = "topology";

export default function ServiceHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView = searchParams.get("view") === TAB_TOPOLOGY ? TAB_TOPOLOGY : TAB_DISCOVERY;

  const setActiveView = (key: string): void => {
    const next = new URLSearchParams(searchParams);
    if (key === TAB_TOPOLOGY) next.set("view", TAB_TOPOLOGY);
    else next.delete("view");
    setSearchParams(next);
  };

  return (
    <PageShell>
      <PageHeader
        title="Service"
        subtitle="Service catalog, health, and runtime topology"
        icon={<Server size={24} />}
      />
      <Tabs
        activeKey={activeView}
        onChange={setActiveView}
        items={[
          { key: TAB_DISCOVERY, label: "Discovery" },
          { key: TAB_TOPOLOGY, label: "Topology" },
        ]}
      />
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
