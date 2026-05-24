import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type StatusTimeseriesPoint,
  getStatusTimeseries,
} from "@/features/services/api/serviceDetailApi";

export function useStatusTimeseries(serviceName: string) {
  return useTimeRangeQuery<StatusTimeseriesPoint[]>(
    "service-detail.status-timeseries",
    (_team, start, end) => getStatusTimeseries(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
