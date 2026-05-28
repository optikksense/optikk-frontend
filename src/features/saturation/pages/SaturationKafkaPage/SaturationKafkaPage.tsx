import { Suspense, lazy, useMemo } from "react";

import { PageTabs } from "@shared/components/primitives/ui";
import { PageShell } from "@shared/components/ui";
import { Loading } from "@shared/components/ui/feedback";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { KafkaPageHeader } from "./header/KafkaPageHeader";
import { useKafkaConsumerLagSeries } from "./hooks/useKafkaConsumerLagSeries";
import { useKafkaSummary } from "./hooks/useKafkaSummary";
import { KafkaKpiStrip } from "./kpi/KafkaKpiStrip";

const OverviewTab = lazy(() => import("./tabs/OverviewTab"));
const TopicsTab = lazy(() => import("./tabs/TopicsTab"));
const ConsumerGroupsTab = lazy(() => import("./tabs/ConsumerGroupsTab"));
const E2ELatencyTab = lazy(() => import("./tabs/E2ELatencyTab"));

const TAB_IDS = ["overview", "topics", "groups", "e2e"] as const;
type TabId = (typeof TAB_IDS)[number];

const URL_TAB = "tab";
const LAG_DEGRADED_THRESHOLD = 1000;

function parseTab(raw: string | null): TabId {
  if (raw && (TAB_IDS as readonly string[]).includes(raw)) return raw as TabId;
  return "overview";
}

function lastValue(values: readonly number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

export default function SaturationKafkaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const summaryQ = useKafkaSummary();
  const { series: lagSeries } = useKafkaConsumerLagSeries();

  const activeTab = useMemo(() => parseTab(searchParams.get(URL_TAB)), [searchParams]);
  const setTab = (id: TabId) => {
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete(URL_TAB);
    else next.set(URL_TAB, id);
    setSearchParams(next, { replace: true });
  };

  const lastLag = lastValue(lagSeries.totalLag);
  const degraded =
    lastLag >= LAG_DEGRADED_THRESHOLD
      ? { label: `degraded · ${Math.round(lastLag).toLocaleString()} msgs lag` }
      : null;

  const tabItems = [
    { key: "overview", label: "Overview" },
    { key: "topics", label: "Topics", count: summaryQ.data?.topic_count },
    { key: "groups", label: "Consumer groups", count: summaryQ.data?.group_count },
    { key: "e2e", label: "E2E latency" },
  ];

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <KafkaPageHeader summary={summaryQ.data} degraded={degraded} />
        <SaturationSubnav active="kafka" counts={{ kafka: summaryQ.data?.topic_count }} />
        <KafkaKpiStrip summary={summaryQ.data} />
        <PageTabs items={tabItems} activeKey={activeTab} onChange={(k) => setTab(k as TabId)} />
        <Suspense fallback={<Loading />}>
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "topics" && <TopicsTab />}
          {activeTab === "groups" && <ConsumerGroupsTab />}
          {activeTab === "e2e" && <E2ELatencyTab />}
        </Suspense>
      </div>
    </PageShell>
  );
}
