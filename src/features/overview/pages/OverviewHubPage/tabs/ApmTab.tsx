import { Suspense, lazy, useMemo } from "react";

import { Skeleton, Surface } from "@/components/ui";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { OVERVIEW_QUERY_STALE_MS } from "@/features/overview/overviewHubConstants";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { groupTimeseries } from "@shared/components/ui/dashboard/utils/dashboardListBuilders";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { HubSection } from "../HubSection";
import { HubChartCard } from "../HubChartCard";
import { mapApmCpuRows, mapApmTimeBucketRows, num } from "../chartMappers";

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

export default function ApmTab() {
  const opts = { staleTime: OVERVIEW_QUERY_STALE_MS };
  const rpcRateQ = useTimeRangeQuery(
    "overview-apm-rpc-rr",
    (_t, s, e) => overviewHubApi.getApmRpcRequestRate(s, e),
    opts
  );
  const rpcDurQ = useTimeRangeQuery(
    "overview-apm-rpc-dur",
    (_t, s, e) => overviewHubApi.getApmRpcDuration(s, e),
    opts
  );
  const cpuQ = useTimeRangeQuery("overview-apm-cpu", (_t, s, e) => overviewHubApi.getApmProcessCpu(s, e), opts);
  const memQ = useTimeRangeQuery("overview-apm-mem", (_t, s, e) => overviewHubApi.getApmProcessMemory(s, e), opts);
  const fdsQ = useTimeRangeQuery("overview-apm-fds", (_t, s, e) => overviewHubApi.getApmOpenFds(s, e), opts);

  const rpcRows = useMemo(() => mapApmTimeBucketRows(rpcRateQ.data ?? []), [rpcRateQ.data]);
  const rpcFlat = useMemo(() => {
    return rpcRows.map((r) => ({
      timestamp: r.timestamp,
      value: num(r.value),
    }));
  }, [rpcRows]);
  const cpuRows = useMemo(() => mapApmCpuRows(cpuQ.data ?? []), [cpuQ.data]);
  const cpuMap = useMemo(() => groupTimeseries(cpuRows, "state"), [cpuRows]);
  const fdsRows = useMemo(() => mapApmTimeBucketRows(fdsQ.data ?? []), [fdsQ.data]);
  const fdsMap = useMemo(() => {
    const m: Record<string, typeof fdsRows> = { fds: fdsRows };
    return m;
  }, [fdsRows]);

  const hist = rpcDurQ.data;
  const mem = memQ.data;

  return (
    <div className="page-section">
      <HubSection
        title="Runtime signals"
        description="RPC throughput, process CPU states, memory footprint, and descriptor usage from runtime metrics."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "RPC P50", value: num(hist?.p50).toFixed(2) },
            { label: "RPC P95", value: num(hist?.p95).toFixed(2) },
            { label: "RPC P99", value: num(hist?.p99).toFixed(2) },
            { label: "RPC Avg", value: num(hist?.avg).toFixed(2) },
          ].map((k) => (
            <Surface key={k.label} elevation={1} padding="sm">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{k.label} (ms)</div>
              <div className="mt-1 font-semibold text-[17px] tabular-nums text-[var(--text-primary)]">
                {rpcDurQ.isPending && !rpcDurQ.data ? "—" : k.value}
              </div>
            </Surface>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-2">
          <Surface elevation={1} padding="sm">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Memory RSS</div>
            <div className="mt-1 font-semibold text-[17px] tabular-nums text-[var(--text-primary)]">
              {memQ.isPending && !memQ.data ? "—" : `${(num(mem?.rss) / 1_048_576).toFixed(1)} MiB`}
            </div>
          </Surface>
          <Surface elevation={1} padding="sm">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Memory VMS</div>
            <div className="mt-1 font-semibold text-[17px] tabular-nums text-[var(--text-primary)]">
              {memQ.isPending && !memQ.data ? "—" : `${(num(mem?.vms) / 1_048_576).toFixed(1)} MiB`}
            </div>
          </Surface>
        </div>
      </HubSection>

      <HubSection title="Charts">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <HubChartCard title="RPC request rate">
            <Suspense fallback={chartFallback()}>
              {rpcFlat.length === 0 && !rpcRateQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  data={rpcFlat.map((r) => ({
                    timestamp: r.timestamp,
                    value: r.value,
                  }))}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                  valueKey="value"
                  datasetLabel="Events / bucket"
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="Process CPU by state">
            <Suspense fallback={chartFallback()}>
              {cpuRows.length === 0 && !cpuQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  serviceTimeseriesMap={cpuMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                  valueKey="value"
                  datasetLabel="CPU"
                />
              )}
            </Suspense>
          </HubChartCard>
          <HubChartCard title="Open file descriptors">
            <Suspense fallback={chartFallback()}>
              {fdsRows.length === 0 && !fdsQ.isPending ? (
                <ChartNoDataOverlay />
              ) : (
                <RequestChart
                  serviceTimeseriesMap={fdsMap}
                  endpoints={[]}
                  selectedEndpoints={[]}
                  fillHeight
                  height={240}
                  valueKey="value"
                  datasetLabel="FDs"
                />
              )}
            </Suspense>
          </HubChartCard>
        </div>
      </HubSection>
    </div>
  );
}
