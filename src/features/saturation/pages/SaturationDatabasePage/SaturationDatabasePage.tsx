import { Suspense, lazy, useMemo } from "react";

import { PageTabs } from "@shared/components/primitives/ui";
import { PageShell } from "@shared/components/ui";
import { Loading } from "@shared/components/ui/feedback";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { DatabasePageHeader } from "./header/DatabasePageHeader";
import { useDatabaseSummary } from "./hooks/useDatabaseSummary";
import { DatabaseKpiStrip } from "./kpi/DatabaseKpiStrip";

const OverviewTab = lazy(() => import("./tabs/OverviewTab"));
const QueriesTab = lazy(() => import("./tabs/QueriesTab"));
const SystemsTab = lazy(() => import("./tabs/SystemsTab"));

const TAB_IDS = ["overview", "queries", "systems"] as const;
type TabId = (typeof TAB_IDS)[number];

const URL_TAB = "tab";
const ERROR_RATE_DEGRADED = 0.01;
const P95_DEGRADED_MS = 1000;

function parseTab(raw: string | null): TabId {
  if (raw && (TAB_IDS as readonly string[]).includes(raw)) return raw as TabId;
  return "overview";
}

export default function SaturationDatabasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const summaryQ = useDatabaseSummary();

  const activeTab = useMemo(() => parseTab(searchParams.get(URL_TAB)), [searchParams]);
  const setTab = (id: TabId) => {
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete(URL_TAB);
    else next.set(URL_TAB, id);
    setSearchParams(next, { replace: true });
  };

  const summary = summaryQ.data;
  const degraded =
    summary &&
    (summary.error_rate >= ERROR_RATE_DEGRADED || summary.p95_latency_ms >= P95_DEGRADED_MS)
      ? {
          label:
            summary.error_rate >= ERROR_RATE_DEGRADED
              ? `degraded · error rate ${(summary.error_rate * 100).toFixed(1)}%`
              : `degraded · p95 ${Math.round(summary.p95_latency_ms)}ms`,
        }
      : null;

  const tabItems = [
    { key: "overview", label: "Overview" },
    { key: "queries", label: "Queries" },
    { key: "systems", label: "Systems", count: summary?.database_systems },
  ];

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <DatabasePageHeader summary={summary} degraded={degraded} />
        <SaturationSubnav
          active="database"
          counts={{ database: summary?.database_systems }}
        />
        <DatabaseKpiStrip summary={summary} />
        <PageTabs items={tabItems} activeKey={activeTab} onChange={(k) => setTab(k as TabId)} />
        <Suspense fallback={<Loading />}>
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "queries" && <QueriesTab />}
          {activeTab === "systems" && <SystemsTab />}
        </Suspense>
      </div>
    </PageShell>
  );
}
