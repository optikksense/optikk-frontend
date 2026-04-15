import { useLocation, useNavigate } from "@tanstack/react-router";
import { Suspense, lazy, useMemo } from "react";

import { Skeleton, Surface } from "@/components/ui";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import type { DashboardDataSources, DashboardPanelSpec } from "@/types/dashboardConfig";
import { ErrorHotspotRankingRenderer } from "@/features/overview/dashboard/renderers/ErrorHotspotRankingRenderer";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { buildDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import { groupTimeseries } from "@shared/components/ui/dashboard/utils/dashboardListBuilders";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { HubSection } from "../HubSection";
import { HubChartCard } from "../HubChartCard";
import {
  mapErrorRateRows,
  mapExceptionTypeRows,
  mapRequestRateRows,
  num,
  str,
} from "../chartMappers";

const ErrorRateChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ErrorRateChart").then((m) => ({ default: m.default }))
);
const RequestChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/RequestChart").then((m) => ({ default: m.default }))
);
const ExceptionTypeLineChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ExceptionTypeLineChart").then((m) => ({ default: m.default }))
);

const HOTSPOT_PANEL: DashboardPanelSpec = {
  id: "hub-error-hotspot",
  panelType: "error-hotspot-ranking",
  layoutVariant: "ranking",
  sectionId: "hub-errors",
  order: 0,
  query: { method: "GET", endpoint: "/v1/spans/error-hotspot" },
  layout: { x: 0, y: 0, w: 12, h: 6 },
};

function chartFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Skeleton active className="h-32 w-full max-w-md" />
    </div>
  );
}

export default function ErrorsTab() {
  const navigate = useNavigate();
  const location = useLocation();

  const serQ = useTimeRangeQuery("overview-err-ser", (_t, s, e) =>
    overviewHubApi.getErrorsServiceErrorRate(s, e)
  );
  const volQ = useTimeRangeQuery("overview-err-vol", (_t, s, e) => overviewHubApi.getErrorsVolume(s, e));
  const exQ = useTimeRangeQuery("overview-err-ex", (_t, s, e) =>
    overviewHubApi.getExceptionRateByType(s, e)
  );
  const hotQ = useTimeRangeQuery("overview-err-hot", (_t, s, e) => overviewHubApi.getErrorHotspot(s, e));
  const groupsQ = useTimeRangeQuery("overview-err-groups", (_t, s, e) => overviewHubApi.getErrorGroups(s, e));

  const serRows = useMemo(() => mapErrorRateRows(serQ.data ?? []), [serQ.data]);
  const volRows = useMemo(() => mapRequestRateRows(volQ.data ?? []), [volQ.data]);
  const volMap = useMemo(() => {
    const mapped = (volQ.data ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        timestamp: str(r.timestamp ?? r.time_bucket),
        service_name: str(r.service_name),
        request_count: num(r.request_count),
        value: num(r.error_count),
      };
    });
    return groupTimeseries(mapped, "service_name");
  }, [volQ.data]);

  const exRows = useMemo(() => mapExceptionTypeRows(exQ.data ?? []), [exQ.data]);
  const exMap = useMemo(() => groupTimeseries(exRows, "exception_type"), [exRows]);

  const serMap = useMemo(() => groupTimeseries(serRows, "service_name"), [serRows]);

  const hotspotSources = useMemo((): DashboardDataSources => {
    const rows = Array.isArray(hotQ.data) ? hotQ.data : [];
    return { [HOTSPOT_PANEL.id]: rows as DashboardDataSources[string] };
  }, [hotQ.data]);

  const hotRowCount = Array.isArray(hotQ.data) ? hotQ.data.length : 0;

  const groupRows = useMemo(() => {
    const raw = groupsQ.data ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        group_id: str(r.group_id),
        service_name: str(r.service_name),
        operation_name: str(r.operation_name),
        http_status_code: num(r.http_status_code),
        error_count: num(r.error_count),
        sample_trace_id: str(r.sample_trace_id),
      };
    });
  }, [groupsQ.data]);

  const drawerAction = {
    entity: "errorGroup" as const,
    idField: "group_id",
    titleField: "operation_name",
  };

  return (
    <div className="page-section">
      <HubSection title="Error rates & volume">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <HubChartCard title="Service error rate">
            <Suspense fallback={chartFallback()}>
              {serRows.length === 0 && !serQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <ErrorRateChart
                  serviceTimeseriesMap={serMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="Error volume">
            <Suspense fallback={chartFallback()}>
              {volRows.length === 0 && !volQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  serviceTimeseriesMap={volMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                  valueKey="value"
                  datasetLabel="Errors"
                />
              )}
            </Suspense>
          </HubChartCard>
        </div>
      </HubSection>

      <HubSection title="Exceptions by type">
        <HubChartCard title="Exception rate">
          <Suspense fallback={chartFallback()}>
            {exRows.length === 0 && !exQ.isPending ? (
              <ChartNoDataOverlay />
            ) : (
              <ExceptionTypeLineChart
                serviceTimeseriesMap={exMap}
                endpoints={[]}
                selectedEndpoints={[]}
                fillHeight
                height={280}
              />
            )}
          </Suspense>
        </HubChartCard>
      </HubSection>

      <HubSection title="Hotspots">
        <Surface elevation={1} padding="sm" className="min-h-[280px]">
          {hotQ.isPending && hotRowCount === 0 ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <ErrorHotspotRankingRenderer chartConfig={HOTSPOT_PANEL} dataSources={hotspotSources} fillHeight />
          )}
        </Surface>
      </HubSection>

      <HubSection title="Fingerprinted groups">
        <Surface elevation={1} padding="sm" className="overflow-x-auto">
          {groupsQ.isPending && groupRows.length === 0 ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : groupRows.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[var(--text-muted)]">No error groups</div>
          ) : (
            <table className="w-full min-w-[800px] border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-[var(--border-color)] border-b text-[var(--text-secondary)]">
                  <th className="pb-2 pr-3 font-medium">Group</th>
                  <th className="pb-2 pr-3 font-medium">Service</th>
                  <th className="pb-2 pr-3 font-medium">Operation</th>
                  <th className="pb-2 pr-3 text-right font-medium">HTTP</th>
                  <th className="pb-2 pr-3 text-right font-medium">Errors</th>
                  <th className="pb-2 font-medium">Sample trace</th>
                </tr>
              </thead>
              <tbody>
                {groupRows.map((g) => (
                  <tr
                    key={g.group_id}
                    className="cursor-pointer border-[var(--border-color)]/60 border-b hover:bg-[var(--bg-hover)]"
                    onClick={() => {
                      const qs = buildDashboardDrawerSearch(
                        location.search,
                        drawerAction,
                        g as Record<string, unknown>
                      );
                      if (qs) navigate({ to: location.pathname + qs });
                    }}
                  >
                    <td className="max-w-[180px] truncate py-2 pr-3 font-mono text-[11px]">{g.group_id}</td>
                    <td className="py-2 pr-3">{g.service_name}</td>
                    <td className="py-2 pr-3 text-[var(--text-secondary)]">{g.operation_name}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{g.http_status_code || "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatNumber(g.error_count)}</td>
                    <td className="py-2 font-mono text-[11px] text-[var(--color-primary)]">
                      {g.sample_trace_id || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Surface>
      </HubSection>
    </div>
  );
}
