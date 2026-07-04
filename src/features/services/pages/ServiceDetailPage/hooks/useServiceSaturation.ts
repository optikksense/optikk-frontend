import {
  type SaturationTimeSeriesPoint,
  getServiceSaturationTimeseries,
} from "@/features/services/api/redApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useServiceSaturation(serviceName: string) {
  return useTimeRangeQuery<SaturationTimeSeriesPoint[]>(
    `service-detail.saturation:${serviceName}`,
    (_tenant, start, end) => getServiceSaturationTimeseries(start, end, serviceName),
    { enabled: Boolean(serviceName) }
  );
}
