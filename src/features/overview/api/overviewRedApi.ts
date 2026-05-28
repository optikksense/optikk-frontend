import type { RequestTime } from "@shared/api/service-types";

import { getJson } from "./overviewClient";

export interface RedSummary {
  service_count?: number;
  total_span_count?: number;
  total_errors?: number;
  total_rps?: number;
  avg_error_pct?: number;
  avg_p50_ms?: number;
  avg_p95_ms?: number;
  avg_p99_ms?: number;
  services?: any[];
}

export function getRedSummary(startTime: RequestTime, endTime: RequestTime): Promise<RedSummary> {
  return getJson("/spans/red/summary", startTime, endTime);
}

export function getRedP95Series(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
  return getJson("/spans/red/p95-latency", startTime, endTime);
}

export function getRedRequestRateSeries(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/red/request-rate", startTime, endTime);
}

export function getRedErrorRateSeries(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/errors/service-error-rate", startTime, endTime);
}
