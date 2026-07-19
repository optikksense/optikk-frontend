import { Tabs } from "@shared/components/primitives/ui";
import { EmptyState, Loading, PageHeader, PageShell } from "@shared/components/ui";
import { Cloud } from "lucide-react";
import { useState } from "react";

import { providerMeta } from "../../constants";
import { useCloudOverview } from "../../hooks/useCloud";
import { AllCloudsView } from "./AllCloudsView";
import { CloudDetailView } from "./CloudDetailView";

const ALL_TAB = "all";

export default function CloudPage(): JSX.Element {
  const [tab, setTab] = useState(ALL_TAB);
  const overviewQ = useCloudOverview();
  const overview = overviewQ.data;
  const providers = overview?.providers ?? [];

  const tabItems = [
    { key: ALL_TAB, label: "All clouds" },
    ...providers.map((p) => ({ key: p.provider, label: providerMeta(p.provider).label })),
  ];

  // Fall back to the all-clouds view if a provider tab is no longer present.
  const active = tab !== ALL_TAB && !providers.some((p) => p.provider === tab) ? ALL_TAB : tab;
  const activeSummary = providers.find((p) => p.provider === active);

  const subtitle = overview
    ? `${overview.totalResources.toLocaleString()} resources · ${overview.totalAccounts} accounts · ${overview.totalRegions} regions across ${providers.length} provider${providers.length === 1 ? "" : "s"}`
    : "Cloud & Kubernetes inventory derived from telemetry";

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Cloud" icon={<Cloud size={24} />} subtitle={subtitle} />

      {overviewQ.isError ? (
        <div
          className="rounded-lg border border-[color-mix(in_oklch,var(--color-error),transparent_65%)] bg-error-subtle px-3.5 py-2.5 text-[12.5px] text-error"
          role="alert"
        >
          Could not load cloud inventory: {overviewQ.error.message}
        </div>
      ) : null}

      {overviewQ.isPending ? <Loading /> : null}

      {overview && providers.length === 0 ? (
        <EmptyState
          title="No cloud telemetry yet"
          description="Cloud inventory is derived from cloud.* and k8s.* resource attributes on incoming telemetry. Once services report them, providers appear here."
        />
      ) : null}

      {overview && providers.length > 0 ? (
        <>
          <Tabs activeKey={active} onChange={setTab} className="mt-1" items={tabItems} />
          {active === ALL_TAB ? (
            <AllCloudsView overview={overview} onOpenProvider={setTab} />
          ) : activeSummary ? (
            <CloudDetailView summary={activeSummary} />
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}
