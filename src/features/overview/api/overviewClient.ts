import api from "@/shared/api/api/client";
import { API_CONFIG } from "@config/apiConfig";
import type { RequestTime } from "@shared/api/service-types";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

function rangeParams(startTime: RequestTime, endTime: RequestTime): Record<string, RequestTime> {
  return { startTime, endTime };
}

export async function getJson<T>(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<T> {
  const raw = await api.get<unknown>(`${V1}${path}`, { params: rangeParams(startTime, endTime) });
  return unwrapEnvelope<T>(raw);
}
