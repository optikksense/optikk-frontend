import { getServiceErrorRate } from "@/features/errors/api/errorGroupsApi";
import { getServiceMetrics, getTopEndpoints } from "@/features/overview/api/serviceMetricsApi";
import { getServiceTopology } from "@shared/components/ui/charts/ServiceTopologyGraph";
import {
  getLatencyPercentilesTimeseries,
  getStatusTimeseries,
} from "@/features/services/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

/**
 * Fans the six panel queries that drive the Service Detail drawer. Split
 * out from `useServiceDetailDrawerModel` so the main hook stays under the
 * 200-line file budget.
 */
export function useServiceDrawerQueries(serviceName: string) {
  const enabled = Boolean(serviceName);
  const opts = { extraKeys: [serviceName], enabled };

  const metricsQuery = useTimeRangeQuery(
    "service-drawer-metrics",
    async (_t, s, e) => getServiceMetrics(s, e),
    opts
  );

  const requestTrendQuery = useTimeRangeQuery(
    "service-drawer-request-trend",
    async (_t, s, e) => getStatusTimeseries(s, e, serviceName),
    opts
  );

  const errorTrendQuery = useTimeRangeQuery(
    "service-drawer-error-trend",
    async (_t, s, e) => getServiceErrorRate(s, e, { serviceName }),
    opts
  );

  const latencyTrendQuery = useTimeRangeQuery(
    "service-drawer-latency-trend",
    async (_t, s, e) => getLatencyPercentilesTimeseries(s, e, serviceName),
    opts
  );

  const endpointsQuery = useTimeRangeQuery(
    "service-drawer-endpoints",
    async (_t, s, e) => getTopEndpoints(s, e, serviceName, 6),
    opts
  );

  const dependenciesQuery = useTimeRangeQuery(
    "service-drawer-dependencies",
    async (_t, s, e) => getServiceTopology({ startTime: s, endTime: e, service: serviceName }),
    opts
  );

  return {
    metricsQuery,
    requestTrendQuery,
    errorTrendQuery,
    latencyTrendQuery,
    endpointsQuery,
    dependenciesQuery,
  };
}
