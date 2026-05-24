import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface SloStatsResponse {
  readonly sli?: number;
  readonly slo?: number;
  readonly error_budget_remaining?: number;
  readonly good_events?: number;
  readonly total_events?: number;
}

async function fetchSloStats(
  s: RequestTime,
  e: RequestTime,
  serviceName: string
): Promise<SloStatsResponse> {
  return api.get<SloStatsResponse>(`${V1}/slo/stats`, {
    params: { startTime: s, endTime: e, serviceName },
  });
}

export function useSloStats(serviceName: string) {
  return useTimeRangeQuery<SloStatsResponse>(
    "service-detail.slo-stats",
    (_team, start, end) => fetchSloStats(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
