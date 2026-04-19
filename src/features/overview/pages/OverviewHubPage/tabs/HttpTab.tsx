import { Suspense, lazy, useMemo } from "react";

import { Skeleton, Surface } from "@/components/ui";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { OVERVIEW_QUERY_STALE_MS } from "@/features/overview/overviewHubConstants";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { groupTimeseries } from "@shared/components/ui/dashboard/utils/dashboardListBuilders";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { HubSection } from "../HubSection";
import { HubChartCard } from "../HubChartCard";
import { mapHttpErrorTsRows, mapHttpStatusRateRows, num } from "../chartMappers";

const RequestChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/RequestChart").then((m) => ({ default: m.default }))
);
const ErrorRateChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ErrorRateChart").then((m) => ({ default: m.default }))
);

function chartFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Skeleton active className="h-32 w-full max-w-md" />
    </div>
  );
}

export default function HttpTab() {
  const opts = { staleTime: OVERVIEW_QUERY_STALE_MS };
  const rrQ = useTimeRangeQuery("overview-http-rr", (_t, s, e) => overviewHubApi.getHttpRequestRate(s, e), opts);
  const durQ = useTimeRangeQuery(
    "overview-http-dur",
    (_t, s, e) => overviewHubApi.getHttpRequestDuration(s, e),
    opts
  );
  const distQ = useTimeRangeQuery(
    "overview-http-dist",
    (_t, s, e) => overviewHubApi.getHttpStatusDistribution(s, e),
    opts
  );
  const errQ = useTimeRangeQuery(
    "overview-http-err",
    (_t, s, e) => overviewHubApi.getHttpErrorTimeseries(s, e),
    opts
  );

  const rrRows = useMemo(() => mapHttpStatusRateRows(rrQ.data ?? []), [rrQ.data]);
  const rrMap = useMemo(() => groupTimeseries(rrRows, "status_code"), [rrRows]);

  const errRows = useMemo(() => mapHttpErrorTsRows(errQ.data ?? []), [errQ.data]);
  const errFlat = useMemo(() => {
    return errRows.map((r) => ({
      timestamp: r.timestamp,
      error_rate: num(r.error_rate),
      value: num(r.error_rate),
    }));
  }, [errRows]);

  const hist = durQ.data;
  const dist = distQ.data ?? [];
  const distMax = useMemo(() => {
    let m = 1;
    for (const row of dist) {
      const r = row as Record<string, unknown>;
      m = Math.max(m, num(r.count));
    }
    return m;
  }, [dist]);

  return (
    <div className="page-section">
      <HubSection title="HTTP server" description="Semantic conventions for HTTP spans—status codes, durations, and error trends.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Duration P50", value: num(hist?.p50).toFixed(2) },
            { label: "Duration P95", value: num(hist?.p95).toFixed(2) },
            { label: "Duration P99", value: num(hist?.p99).toFixed(2) },
            { label: "Duration Avg", value: num(hist?.avg).toFixed(2) },
          ].map((k) => (
            <Surface key={k.label} elevation={1} padding="sm">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{k.label} (ms)</div>
              <div className="mt-1 font-semibold text-[17px] tabular-nums text-[var(--text-primary)]">
                {durQ.isPending && !durQ.data ? "—" : k.value}
              </div>
            </Surface>
          ))}
        </div>
      </HubSection>

      <HubSection title="Traffic shape">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <HubChartCard title="Request rate by status">
            <Suspense fallback={chartFallback()}>
              {rrRows.length === 0 && !rrQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  serviceTimeseriesMap={rrMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                  valueKey="count"
                  datasetLabel="Requests"
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="HTTP error rate">
            <Suspense fallback={chartFallback()}>
              {errFlat.length === 0 && !errQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <ErrorRateChart
                  data={errFlat}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                />
              )}
            </Suspense>
          </HubChartCard>
        </div>
      </HubSection>

      <HubSection title="Status distribution">
        <Surface elevation={1} padding="sm">
          {dist.length === 0 && !distQ.isPending ? (
            <ChartNoDataOverlay />
          ) : (
            <div className="flex flex-col gap-2">
              {(dist as Record<string, unknown>[]).map((r) => {
                const label = String(r.status_group ?? "");
                const c = num(r.count);
                const pct = Math.round((c / distMax) * 100);
                return (
                  <div key={label}>
                    <div className="mb-0.5 flex justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>{label || "unknown"}</span>
                      <span className="tabular-nums">{c}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Surface>
      </HubSection>
    </div>
  );
}
