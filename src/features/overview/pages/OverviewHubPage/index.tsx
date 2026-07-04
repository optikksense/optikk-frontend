import { PageHeader, PageShell } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import { useInView } from "@shared/hooks/useInView";

import InfrastructureStrip from "./components/InfrastructureStrip";
import OverviewHero from "./components/OverviewHero";
import ServiceHealthGrid from "./components/ServiceHealthGrid";
import SystemPerformanceCard from "./components/SystemPerformanceCard";
import TopErrorsCard from "./components/TopErrorsCard";
import {
  useOverviewPerformanceQuery,
  useOverviewSummaryQuery,
  usePerformanceSeries,
  useRankedErrorRows,
  useServiceHealthCells,
  useTopErrorsQuery,
} from "./hooks/useOverviewModel";
import type { ServiceMetricPoint } from "@/features/metrics/types";

function DegradedBadge({ count }: { readonly count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warn-soft)] px-2 py-0.5 align-middle font-semibold text-[12px] text-[var(--warn-fg)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--warn)]" />
      {count} {count === 1 ? "service" : "services"} degraded
    </span>
  );
}

export default function OverviewHubPage() {
  const summaryQ = useOverviewSummaryQuery();
  const { ref: belowRef, inView: belowInView } = useInView<HTMLDivElement>();

  const performanceQ = useOverviewPerformanceQuery(true);
  const errorsQ = useTopErrorsQuery(belowInView);

  const summary = summaryQ.data;
  const summaryLoading = summaryQ.isPending && !summaryQ.data;

  const performance = usePerformanceSeries(performanceQ.data?.pr);
  const healthCells = useServiceHealthCells(summary?.services as unknown as ServiceMetricPoint[]);
  const topErrors = useRankedErrorRows(errorsQ.data);

  const serviceCount = summary?.service_count ?? healthCells.length;
  const degradedCount = healthCells.filter((c) => c.status !== "ok").length;

  return (
    <PageShell>
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-baseline gap-3">
            Overview
            <DegradedBadge count={degradedCount} />
          </span>
        }
        subtitle={`${serviceCount || 0} services · golden signals for the selected time range`}
      />

      <OverviewHero summary={summary} performance={performance} loading={summaryLoading} />

      <div ref={belowRef} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
          <SystemPerformanceCard series={performance} loading={performanceQ.isPending} />
          <ServiceHealthGrid cells={healthCells} />
        </div>

        <TopErrorsCard rows={topErrors} loading={errorsQ.isPending} />

        <InfrastructureStrip />
      </div>

      <DashboardEntityDrawer />
    </PageShell>
  );
}
