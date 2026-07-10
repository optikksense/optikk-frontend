import { api } from "@shared/api/http/client";
import { buildREDFilters } from "@shared/api/red/buildREDFilters";
import type { RequestTime } from "@shared/api/service-types";

import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export async function getErrorHotspot(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  const params = buildREDFilters(startTime, endTime);
  const raw = await api.get<unknown>(`${V1}/spans/error-hotspot`, { params });
  return raw as unknown[];
}
