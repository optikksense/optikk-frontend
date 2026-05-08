import { useMemo } from "react";

import type { EndpointMetricPoint } from "@/features/metrics/types";
import { getTopEndpoints } from "@/features/overview/api/serviceMetricsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

function sortByRequests(rows: readonly EndpointMetricPoint[]): EndpointMetricPoint[] {
  return [...rows].sort(
    (left, right) => Number(right.request_count ?? 0) - Number(left.request_count ?? 0)
  );
}

export function useTopEndpoints(serviceName: string, limit = 10): {
  endpoints: readonly EndpointMetricPoint[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-endpoints",
    (_teamId, start, end) => getTopEndpoints(start, end, serviceName, limit),
    { extraKeys: [serviceName, limit], enabled }
  );

  const endpoints = useMemo(
    () => sortByRequests(query.data ?? []).slice(0, limit),
    [query.data, limit]
  );

  return { endpoints, loading: query.isLoading && endpoints.length === 0 };
}
