import { Suspense, lazy, useMemo } from "react";

import { Skeleton, Surface } from "@/components/ui";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { OVERVIEW_QUERY_STALE_MS } from "@/features/overview/overviewHubConstants";
import LatencyHistogram from "@shared/components/ui/charts/distributions/LatencyHistogram";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { groupTimeseries } from "@shared/components/ui/dashboard/utils/dashboardListBuilders";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { HubSection } from "../HubSection";
import { HubChartCard } from "../HubChartCard";
import {
  mapRedErrorPctRows,
  mapRedRequestRateRows,
  mapP95Rows,
  num,
  str,
} from "../chartMappers";

const LatencyChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/LatencyChart").then((m) => ({ default: m.default }))
);
const ErrorRateChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ErrorRateChart").then((m) => ({ default: m.default }))
);
const RequestChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/RequestChart").then((m) => ({ default: m.default }))
);

function chartFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Skeleton active className="h-32 w-full max-w-md" />
    </div>
  );
}

export default function LatencyRedTab() {
  const opts = { staleTime: OVERVIEW_QUERY_STALE_MS };
  const summaryQ = useTimeRangeQuery("overview-red-summary", (_t, s, e) => overviewHubApi.getRedSummary(s, e), opts);
  const p95Q = useTimeRangeQuery("overview-red-p95", (_t, s, e) => overviewHubApi.getRedP95Series(s, e), opts);
  const rrQ = useTimeRangeQuery("overview-red-rr", (_t, s, e) => overviewHubApi.getRedRequestRateSeries(s, e), opts);
  const erQ = useTimeRangeQuery("overview-red-er", (_t, s, e) => overviewHubApi.getRedErrorRateSeries(s, e), opts);
  const breakdownQ = useTimeRangeQuery(
    "overview-red-breakdown",
    (_t, s, e) => overviewHubApi.getLatencyBreakdown(s, e),
    opts
  );
  const slowQ = useTimeRangeQuery("overview-red-slow", (_t, s, e) => overviewHubApi.getTopSlowOperations(s, e), opts);

  const red = summaryQ.data;

  const p95Rows = useMemo(() => mapP95Rows(p95Q.data ?? []), [p95Q.data]);
  const rrRows = useMemo(() => mapRedRequestRateRows(rrQ.data ?? []), [rrQ.data]);
  const erRows = useMemo(() => mapRedErrorPctRows(erQ.data ?? []), [erQ.data]);

  const p95Map = useMemo(() => groupTimeseries(p95Rows, "service_name"), [p95Rows]);
  const rrMap = useMemo(() => groupTimeseries(rrRows, "service_name"), [rrRows]);
  const erMap = useMemo(() => groupTimeseries(erRows, "service_name"), [erRows]);

  const histogramTraces = useMemo(() => {
    const raw = breakdownQ.data ?? [];
    if (!Array.isArray(raw)) return [];
    const arr = raw as Record<string, unknown>[];
    if (arr.length > 0 && arr[0].duration_ms != null) {
      return arr.map((r) => ({ duration_ms: num(r.duration_ms) }));
    }
    const bucketMidpoint = (bucket: string): number =>
      (
        ({
          "0_10ms": 5,
          "10_25ms": 17,
          "25_50ms": 37,
          "50_100ms": 75,
          "100_250ms": 175,
          "250_500ms": 375,
          "500ms_1s": 750,
          "1s_2500ms": 1750,
          "2500ms_5s": 3750,
          gt_5s: 7000,
        }) as Record<string, number>
      )[bucket] ?? 0;
    return arr.flatMap((bucket) => {
      const count = num(bucket.span_count);
      const mid = bucketMidpoint(str(bucket.bucket));
      return Array.from({ length: Math.min(count, 5000) }, () => ({ duration_ms: mid }));
    });
  }, [breakdownQ.data]);

  const slowRows = useMemo(() => {
    const raw = slowQ.data ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        service: str(r.service_name),
        operation: str(r.operation_name),
        spans: num(r.span_count),
        p50: num(r.p50_ms),
        p95: num(r.p95_ms),
        p99: num(r.p99_ms),
      };
    });
  }, [slowQ.data]);

  return (
    <div className="page-section">
      <HubSection
        title="RED span aggregates"
        description="Request, error, and duration signals computed from trace spans—complements service-level metrics on the Summary tab."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Services", value: num(red?.service_count) },
            { label: "Spans", value: num(red?.total_span_count) },
            { label: "Total RPS", value: num(red?.total_rps).toFixed(2) },
            { label: "Avg error %", value: `${num(red?.avg_error_pct).toFixed(2)}%` },
            { label: "Avg P95 (ms)", value: num(red?.avg_p95_ms).toFixed(1) },
            { label: "Avg P99 (ms)", value: num(red?.avg_p99_ms).toFixed(1) },
          ].map((kpi) => (
            <Surface key={kpi.label} elevation={1} padding="sm">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{kpi.label}</div>
              <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)] tabular-nums">
                {summaryQ.isPending && !summaryQ.data ? "—" : kpi.value}
              </div>
            </Surface>
          ))}
        </div>
      </HubSection>

      <HubSection title="Latency & load">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <HubChartCard title="P95 latency (spans)">
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
          <HubChartCard title="Span RPS">
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
                  valueKey="value"
                  datasetLabel="RPS"
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="Error % (spans)">
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
        </div>
      </HubSection>

      <HubSection title="Latency distribution">
        <Surface elevation={1} padding="sm" className="min-h-[280px]">
          {histogramTraces.length === 0 && !breakdownQ.isPending ? (
            <ChartNoDataOverlay />
          ) : (
            <LatencyHistogram traces={histogramTraces} fillHeight />
          )}
        </Surface>
      </HubSection>

      <HubSection title="Top slow operations">
        <Surface elevation={1} padding="sm" className="overflow-x-auto">
          {slowQ.isPending && slowRows.length === 0 ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : slowRows.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[var(--text-muted)]">No slow operations</div>
          ) : (
            <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-[var(--border-color)] border-b text-[var(--text-secondary)]">
                  <th className="pb-2 pr-3 font-medium">Service</th>
                  <th className="pb-2 pr-3 font-medium">Operation</th>
                  <th className="pb-2 pr-3 text-right font-medium">Spans</th>
                  <th className="pb-2 pr-3 text-right font-medium">P50</th>
                  <th className="pb-2 pr-3 text-right font-medium">P95</th>
                  <th className="pb-2 text-right font-medium">P99</th>
                </tr>
              </thead>
              <tbody>
                {slowRows.map((r) => (
                  <tr key={`${r.service}:${r.operation}`} className="border-[var(--border-color)]/60 border-b">
                    <td className="py-2 pr-3">{r.service}</td>
                    <td className="py-2 pr-3 text-[var(--text-secondary)]">{r.operation}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatNumber(r.spans)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{r.p50.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{r.p95.toFixed(1)}</td>
                    <td className="py-2 text-right tabular-nums">{r.p99.toFixed(1)}</td>
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
