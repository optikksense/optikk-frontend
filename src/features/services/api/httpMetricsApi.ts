import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

/**
 * Thin client for the BE HTTP metrics module (`internal/modules/services/httpmetrics`).
 * 17 endpoints, schemas kept loose (`unknown[]` / `Record<string, unknown>`)
 * because each panel renders a panel-specific shape; pages cast to the
 * narrower type they need at the call site.
 */

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

interface BaseParams {
  serviceName?: string;
  limit?: number;
}

function withRange(
  startTime: RequestTime,
  endTime: RequestTime,
  extra?: BaseParams
): Record<string, RequestTime | string | number | undefined> {
  return { startTime, endTime, ...extra };
}

function get<T>(path: string, params: Record<string, unknown>): Promise<T> {
  return api.get<T>(`${V1}${path}`, { params });
}

export interface HistogramSummary {
  p50?: number;
  p95?: number;
  p99?: number;
  avg?: number;
}

export function getRequestRate(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<unknown[]>("/http/request-rate", withRange(s, e, p));
}
export function getRequestDuration(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<HistogramSummary>("/http/request-duration", withRange(s, e, p));
}
export function getActiveRequests(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<unknown[]>("/http/active-requests", withRange(s, e, p));
}
export function getRequestBodySize(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<HistogramSummary>("/http/request-body-size", withRange(s, e, p));
}
export function getResponseBodySize(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<HistogramSummary>("/http/response-body-size", withRange(s, e, p));
}
export function getClientDuration(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<HistogramSummary>("/http/client-duration", withRange(s, e, p));
}
export function getDNSDuration(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<HistogramSummary>("/http/dns-duration", withRange(s, e, p));
}
export function getTLSDuration(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<HistogramSummary>("/http/tls-duration", withRange(s, e, p));
}
export function getStatusDistribution(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<unknown[]>("/http/status-distribution", withRange(s, e, p));
}
export function getErrorTimeseries(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<unknown[]>("/http/error-timeseries", withRange(s, e, p));
}
export function getTopRoutesByVolume(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<Array<Record<string, unknown>>>("/routes/top-by-volume", withRange(s, e, p));
}
export function getTopRoutesByLatency(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<Array<Record<string, unknown>>>("/routes/top-by-latency", withRange(s, e, p));
}
export function getRouteErrorRate(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<Array<Record<string, unknown>>>("/routes/error-rate", withRange(s, e, p));
}
export function getRouteErrorTimeseries(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<unknown[]>("/routes/error-timeseries", withRange(s, e, p));
}
export function getTopExternalHosts(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<Array<Record<string, unknown>>>("/external/top-hosts", withRange(s, e, p));
}
export function getExternalHostLatency(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<Array<Record<string, unknown>>>("/external/host-latency", withRange(s, e, p));
}
export function getExternalHostErrorRate(s: RequestTime, e: RequestTime, p?: BaseParams) {
  return get<Array<Record<string, unknown>>>("/external/error-rate", withRange(s, e, p));
}
