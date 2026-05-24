import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type LatencyPercentilesPoint,
  getLatencyPercentilesTimeseries,
} from "@/features/services/api/serviceDetailApi";

export function useLatencyPercentiles(serviceName: string) {
  return useTimeRangeQuery<LatencyPercentilesPoint[]>(
    "service-detail.latency-percentiles",
    (_team, start, end) => getLatencyPercentilesTimeseries(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
