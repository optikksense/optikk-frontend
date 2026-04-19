import { Suspense, lazy, useMemo } from "react";

import { Skeleton, Surface } from "@/components/ui";
import { metricsOverviewApi } from "@/features/metrics/api/metricsOverviewApi";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { OVERVIEW_QUERY_STALE_MS } from "@/features/overview/overviewHubConstants";
import { SloIndicatorsRenderer } from "@/features/overview/dashboard/renderers/SloIndicatorsRenderer";
import type { DashboardPanelSpec } from "@/types/dashboardConfig";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { HubSection } from "../HubSection";
import { HubChartCard } from "../HubChartCard";
import { mapBurnDownRows, num } from "../chartMappers";

const RequestChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/RequestChart").then((m) => ({ default: m.default }))
);

const SLO_PANEL: DashboardPanelSpec = {
  id: "hub-slo-indicators",
  panelType: "slo-indicators",
  layoutVariant: "hero",
  sectionId: "hub-slo",
  order: 0,
  query: { method: "GET", endpoint: "/v1/overview/services" },
  layout: { x: 0, y: 0, w: 12, h: 4 },
};

function chartFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Skeleton active className="h-32 w-full max-w-md" />
    </div>
  );
}

export default function SloTab() {
  // Reuse Summary's cache key so Summary → SLO gets a hit instead of refetching the same endpoint.
  const servicesQ = useTimeRangeQuery(
    "overview-hub-services",
    metricsOverviewApi.getOverviewServiceMetrics,
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
  const burnRateQ = useTimeRangeQuery(
    "overview-slo-br",
    (_t, s, e) => overviewHubApi.getSloBurnRate(s, e),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
  const burnDownQ = useTimeRangeQuery(
    "overview-slo-bd",
    (_t, s, e) => overviewHubApi.getSloBurnDown(s, e),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );

  const sloSources = useMemo(() => {
    const rows = (servicesQ.data ?? []).map((s) => ({
      service_name: s.service_name,
      request_count: s.request_count,
      error_count: s.error_count,
      avg_latency: s.avg_latency,
      p50_latency: s.p50_latency,
      p95_latency: s.p95_latency,
      p99_latency: s.p99_latency,
    }));
    return { [SLO_PANEL.id]: rows };
  }, [servicesQ.data]);

  const burn = burnRateQ.data;
  const bdRows = useMemo(() => mapBurnDownRows(burnDownQ.data ?? []), [burnDownQ.data]);
  const bdFlat = useMemo(() => {
    return bdRows.map((r) => ({
      timestamp: r.timestamp,
      value: num(r.error_budget_remaining_pct),
    }));
  }, [bdRows]);

  return (
    <div className="page-section">
      <HubSection
        title="Reliability snapshot"
        description="Synthetic SLO-style view from request outcomes and latency tails—pair with burn metrics below."
      >
        <Surface elevation={1} padding="sm" className="min-h-[200px]">
          {servicesQ.isPending && !(servicesQ.data ?? []).length ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <SloIndicatorsRenderer chartConfig={SLO_PANEL} dataSources={sloSources} fillHeight />
          )}
        </Surface>
      </HubSection>

      <HubSection title="Burn">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Surface elevation={1} padding="sm">
            <div className="mb-3 font-medium text-[12px] text-[var(--text-secondary)]">Burn rate</div>
            {burnRateQ.isPending && !burnRateQ.data ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Fast window</div>
                  <div className="mt-1 font-semibold text-[20px] tabular-nums text-[var(--text-primary)]">
                    {num(burn?.fast_burn_rate).toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Slow window</div>
                  <div className="mt-1 font-semibold text-[20px] tabular-nums text-[var(--text-primary)]">
                    {num(burn?.slow_burn_rate).toFixed(3)}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
                    Budget remaining
                  </div>
                  <div className="mt-1 font-semibold text-[20px] tabular-nums text-[var(--color-primary)]">
                    {num(burn?.budget_remaining_pct).toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
          </Surface>
          <HubChartCard title="Error budget remaining">
            <Suspense fallback={chartFallback()}>
              {bdFlat.length === 0 && !burnDownQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  data={bdFlat}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={220}
                  valueKey="value"
                  datasetLabel="% budget"
                />
              )}
            </Suspense>
          </HubChartCard>
        </div>
      </HubSection>
    </div>
  );
}
