import api from "@/shared/api/api/client";
import type { RequestTime } from "@shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

export const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export function rangeParams(
  startTime: RequestTime,
  endTime: RequestTime
): Record<string, RequestTime> {
  return { startTime, endTime };
}

export function unwrapComparisonPayload<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }
  const record = value as Record<string, unknown>;
  if (!("data" in record)) return value as T;
  const keys = Object.keys(record);
  if (keys.length <= 2 && (keys.length === 1 || "comparison" in record)) {
    return record.data as T;
  }
  return value as T;
}

export async function getJson<T>(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<T> {
  const raw = await api.get<unknown>(`${V1}${path}`, { params: rangeParams(startTime, endTime) });
  return unwrapComparisonPayload<T>(raw);
}

export async function getJsonWithParams<T>(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime,
  extra: Record<string, string | number | undefined>
): Promise<T> {
  const params: Record<string, RequestTime | string | number | undefined> = {
    ...rangeParams(startTime, endTime),
    ...extra,
  };
  const raw = await api.get<unknown>(`${V1}${path}`, { params });
  return unwrapComparisonPayload<T>(raw);
}
