import type { RequestTime } from "@shared/api/service-types";

import { getJson, getJsonWithParams } from "./overviewClient";

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

export function getLatencyBreakdown(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/latency-breakdown", startTime, endTime);
}

export function getRedP95Series(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/red/p95-latency", startTime, endTime);
}

export function getRedRequestRateSeries(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/red/request-rate", startTime, endTime);
}

/**
 * `/spans/red/error-rate` was a phantom — the canonical endpoint is
 * `/errors/service-error-rate`. Path rewritten in Phase 0.
 */
export function getRedErrorRateSeries(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/errors/service-error-rate", startTime, endTime);
}

export function getTopSlowOperations(
  startTime: RequestTime,
  endTime: RequestTime,
  limit = 25
): Promise<unknown[]> {
  return getJsonWithParams("/spans/red/top-slow-operations", startTime, endTime, { limit });
}

export function getTopErrorOperations(
  startTime: RequestTime,
  endTime: RequestTime,
  limit = 25
): Promise<unknown[]> {
  return getJsonWithParams("/spans/red/top-error-operations", startTime, endTime, { limit });
}
