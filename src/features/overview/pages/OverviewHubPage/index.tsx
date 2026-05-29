import { LayoutDashboard } from "lucide-react";

import { PageHeader, PageShell } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import { useInView } from "@shared/hooks/useInView";

import InfrastructureStrip from "./components/InfrastructureStrip";
import OverviewHero from "./components/OverviewHero";
import RecentDeploysCard from "./components/RecentDeploysCard";
import ServiceHealthGrid from "./components/ServiceHealthGrid";
import SystemPerformanceCard from "./components/SystemPerformanceCard";
import TopErrorsCard from "./components/TopErrorsCard";
import {
  useOverviewApdexQuery,
  useOverviewPerformanceQuery,
  useOverviewSummaryQuery,
  usePerformanceSeries,
  useRankedErrorRows,
  useRecentDeploysQuery,
  useServiceHealthCells,
  useTopErrorsQuery,
} from "./hooks/useOverviewModel";

export default function OverviewHubPage() {
  const summaryQ = useOverviewSummaryQuery();
  const apdexQ = useOverviewApdexQuery();
  const { ref: belowRef, inView: belowInView } = useInView<HTMLDivElement>();

  const performanceQ = useOverviewPerformanceQuery(belowInView);
  const errorsQ = useTopErrorsQuery(belowInView);
  const deploysQ = useRecentDeploysQuery(belowInView);

  const summary = summaryQ.data;
  const summaryLoading = summaryQ.isPending && !summaryQ.data;

  const performance = usePerformanceSeries(performanceQ.data?.rr, performanceQ.data?.er);
  const healthCells = useServiceHealthCells(summary?.services);
  const topErrors = useRankedErrorRows(errorsQ.data);

  const serviceCount = summary?.service_count ?? healthCells.length;

  return (
    <PageShell>
      <PageHeader
        title="Overview"
        subtitle={`${serviceCount || 0} services · golden signals for the selected time range`}
        icon={<LayoutDashboard size={22} />}
      />

      <OverviewHero summary={summary} apdex={apdexQ.data} loading={summaryLoading} />

      <div ref={belowRef} className="flex flex-col gap-3">
        <SystemPerformanceCard series={performance} loading={performanceQ.isPending} />

        <ServiceHealthGrid cells={healthCells} />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <TopErrorsCard rows={topErrors} loading={errorsQ.isPending} />
          <RecentDeploysCard rows={deploysQ.data} loading={deploysQ.isPending} />
        </div>

        <InfrastructureStrip />
      </div>

      <DashboardEntityDrawer />
    </PageShell>
  );
}
