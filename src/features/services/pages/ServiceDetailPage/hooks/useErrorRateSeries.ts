import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type ErrorTimeSeriesPoint, getServiceErrorRate } from "@shared/api/errors";

export function useErrorRateSeries(serviceName: string) {
  return useTimeRangeQuery<ErrorTimeSeriesPoint[]>(
    "service-detail.error-rate-series",
    (_tenant, start, end) => getServiceErrorRate(start, end, { serviceName }),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
