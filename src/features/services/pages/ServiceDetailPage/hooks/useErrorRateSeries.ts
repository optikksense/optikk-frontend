import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type ErrorTimeSeriesPoint,
  getServiceErrorRate,
} from "@/features/errors/api/errorGroupsApi";

export function useErrorRateSeries(serviceName: string) {
  return useTimeRangeQuery<ErrorTimeSeriesPoint[]>(
    "service-detail.error-rate-series",
    (_team, start, end) => getServiceErrorRate(start, end, { serviceName }),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
