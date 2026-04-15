import { useLocation, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowDownRight, ArrowUpRight, LayoutDashboard } from "lucide-react";
import { Suspense, lazy, useMemo, useState } from "react";

import { Skeleton, Surface } from "@/components/ui";
import { metricsOverviewApi } from "@/features/metrics/api/metricsOverviewApi";
import type { ServiceMetricPoint } from "@/features/metrics/types";
import { buildServiceDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { groupTimeseries } from "@shared/components/ui/dashboard/utils/dashboardListBuilders";
import StatCard from "@shared/components/ui/cards/StatCard";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber, formatPercentage } from "@shared/utils/formatters";

import { HubSection } from "../HubSection";
import { HubChartCard } from "../HubChartCard";
import { mapErrorRateRows, mapP95Rows, mapRequestRateRows, num } from "../chartMappers";

const RequestChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/RequestChart").then((m) => ({ default: m.default }))
);
const ErrorRateChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ErrorRateChart").then((m) => ({ default: m.default }))
);
const LatencyChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/LatencyChart").then((m) => ({ default: m.default }))
);

type SortKey = "service_name" | "request_count" | "error_rate" | "p95_latency";

function chartFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Skeleton active className="h-32 w-full max-w-md" />
    </div>
  );
}

export default function SummaryTab() {
  const navigate = useNavigate();
  const location = useLocation();

  const summaryQ = useTimeRangeQuery("overview-hub-summary", (_team, start, end) =>
    overviewHubApi.getOverviewSummary(start, end)
  );
  const servicesQ = useTimeRangeQuery<ServiceMetricPoint[]>(
    "overview-hub-services",
    metricsOverviewApi.getOverviewServiceMetrics
  );
  const rrQ = useTimeRangeQuery("overview-hub-rr", metricsOverviewApi.getOverviewRequestRate);
  const erQ = useTimeRangeQuery("overview-hub-er", metricsOverviewApi.getOverviewErrorRate);
  const p95Q = useTimeRangeQuery("overview-hub-p95", metricsOverviewApi.getOverviewP95Latency);

  const summary = summaryQ.data;
  const totalReq = num(summary?.total_requests);
  const errCount = num(summary?.error_count);
  const errPct = totalReq > 0 ? (errCount / totalReq) * 100 : 0;

  const rrRows = useMemo(() => mapRequestRateRows(rrQ.data ?? []), [rrQ.data]);
  const erRows = useMemo(() => mapErrorRateRows(erQ.data ?? []), [erQ.data]);
  const p95Rows = useMemo(() => mapP95Rows(p95Q.data ?? []), [p95Q.data]);

  const rrMap = useMemo(() => groupTimeseries(rrRows, "service_name"), [rrRows]);
  const erMap = useMemo(() => groupTimeseries(erRows, "service_name"), [erRows]);
  const p95Map = useMemo(() => groupTimeseries(p95Rows, "service_name"), [p95Rows]);

  const [sortKey, setSortKey] = useState<SortKey>("request_count");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const serviceList = servicesQ.data ?? [];

  const sortedServices = useMemo(() => {
    const rows = serviceList;
    const next = [...rows];
    next.sort((a, b) => {
      const ar = a.request_count > 0 ? (a.error_count / a.request_count) * 100 : 0;
      const br = b.request_count > 0 ? (b.error_count / b.request_count) * 100 : 0;
      let av = 0;
      let bv = 0;
      switch (sortKey) {
        case "service_name":
          av = a.service_name.localeCompare(b.service_name);
          bv = 0;
          return sortDir === "asc" ? av : -av;
        case "request_count":
          av = a.request_count;
          bv = b.request_count;
          break;
        case "error_rate":
          av = ar;
          bv = br;
          break;
        case "p95_latency":
          av = a.p95_latency;
          bv = b.p95_latency;
          break;
        default:
          break;
      }
      const cmp = av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return next;
  }, [serviceList, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "service_name" ? "asc" : "desc");
    }
  };

  const loadingKpi = summaryQ.isPending && !summaryQ.data;

  return (
    <div className="page-section">
      <HubSection
        title="Golden signals"
        description="Request volume, errors, and latency for the selected time range—aligned with how you triage production health."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            metric={{
              title: "Total requests",
              value: loadingKpi ? "—" : formatNumber(totalReq),
            }}
            visuals={{ loading: loadingKpi, icon: <Activity size={18} />, iconColor: "var(--color-primary)" }}
          />
          <StatCard
            metric={{
              title: "Errors",
              value: loadingKpi ? "—" : formatNumber(errCount),
            }}
            visuals={{
              loading: loadingKpi,
              icon: <ArrowDownRight size={18} />,
              iconColor: "var(--color-error)",
            }}
          />
          <StatCard
            metric={{
              title: "Error rate",
              value: loadingKpi ? "—" : formatPercentage(errPct),
            }}
            visuals={{
              loading: loadingKpi,
              icon: <ArrowUpRight size={18} />,
              iconColor: errPct > 1 ? "var(--color-error)" : "var(--text-muted)",
            }}
          />
          <StatCard
            metric={{
              title: "Avg latency",
              value: loadingKpi ? "—" : `${num(summary?.avg_latency).toFixed(1)} ms`,
            }}
            visuals={{ loading: loadingKpi }}
          />
          <StatCard
            metric={{
              title: "P95 latency",
              value: loadingKpi ? "—" : `${num(summary?.p95_latency).toFixed(1)} ms`,
            }}
            visuals={{ loading: loadingKpi }}
          />
          <StatCard
            metric={{
              title: "P99 latency",
              value: loadingKpi ? "—" : `${num(summary?.p99_latency).toFixed(1)} ms`,
            }}
            visuals={{ loading: loadingKpi, icon: <LayoutDashboard size={18} />, iconColor: "var(--text-muted)" }}
          />
        </div>
      </HubSection>

      <HubSection title="Traffic & latency" description="Per-service series (top lists follow chart conventions).">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <HubChartCard title="Request rate">
            <Suspense fallback={chartFallback()}>
              {rrRows.length === 0 && !rrQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  serviceTimeseriesMap={rrMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={220}
                  datasetLabel="Requests"
                  valueKey="request_count"
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="Error rate">
            <Suspense fallback={chartFallback()}>
              {erRows.length === 0 && !erQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <ErrorRateChart
                  serviceTimeseriesMap={erMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={220}
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="P95 latency">
            <Suspense fallback={chartFallback()}>
              {p95Rows.length === 0 && !p95Q.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <LatencyChart
                  serviceTimeseriesMap={p95Map}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={220}
                />
              )}
            </Suspense>
          </HubChartCard>
        </div>
      </HubSection>

      <HubSection
        title="Services"
        description="Sortable inventory with traffic, error share, and tail latency—click a row to open the service drawer from the shell."
      >
        <Surface elevation={1} padding="sm" className="overflow-x-auto">
          {servicesQ.isPending && serviceList.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : sortedServices.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[var(--text-muted)]">No service metrics in range</div>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-[var(--border-color)] border-b text-[var(--text-secondary)]">
                  <th className="pb-2 pr-3">
                    <button
                      type="button"
                      className="font-medium hover:text-[var(--text-primary)]"
                      onClick={() => toggleSort("service_name")}
                    >
                      Service {sortKey === "service_name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="pb-2 pr-3 text-right">
                    <button
                      type="button"
                      className="font-medium hover:text-[var(--text-primary)]"
                      onClick={() => toggleSort("request_count")}
                    >
                      Requests {sortKey === "request_count" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="pb-2 pr-3 text-right">
                    <button
                      type="button"
                      className="font-medium hover:text-[var(--text-primary)]"
                      onClick={() => toggleSort("error_rate")}
                    >
                      Err % {sortKey === "error_rate" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="pb-2 pr-3 text-right">
                    <button
                      type="button"
                      className="font-medium hover:text-[var(--text-primary)]"
                      onClick={() => toggleSort("p95_latency")}
                    >
                      P95 (ms) {sortKey === "p95_latency" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="pb-2 text-right">P99 (ms)</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((s: ServiceMetricPoint) => {
                  const er = s.request_count > 0 ? (s.error_count / s.request_count) * 100 : 0;
                  return (
                    <tr
                      key={s.service_name}
                      className="cursor-pointer border-[var(--border-color)]/60 border-b hover:bg-[var(--bg-hover)]"
                      onClick={() =>
                        navigate({
                          to:
                            location.pathname +
                            buildServiceDrawerSearch(location.search, {
                              name: s.service_name,
                              requestCount: s.request_count,
                              errorCount: s.error_count,
                              errorRate: er,
                              avgLatency: s.avg_latency,
                              p95Latency: s.p95_latency,
                              p99Latency: s.p99_latency,
                            }),
                        })
                      }
                    >
                      <td className="py-2 pr-3 font-medium text-[var(--text-primary)]">{s.service_name}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{formatNumber(s.request_count)}</td>
                      <td
                        className="py-2 pr-3 text-right tabular-nums"
                        style={{ color: er > 1 ? "var(--color-error)" : "var(--text-secondary)" }}
                      >
                        {formatPercentage(er)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{s.p95_latency.toFixed(1)}</td>
                      <td className="py-2 text-right tabular-nums">{s.p99_latency.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Surface>
      </HubSection>
    </div>
  );
}
