import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

interface ServiceFilter {
  serviceName?: string;
}

function range(s: RequestTime, e: RequestTime, p?: ServiceFilter) {
  return { startTime: s, endTime: e, ...p };
}

export interface SpanKindBreakdownRow {
  readonly span_kind: string;
  readonly request_count: number;
  readonly p95_latency_ms: number;
  readonly error_rate: number;
}

export interface RouteErrorRow {
  readonly route: string;
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
}

export function getSpanKindBreakdown(s: RequestTime, e: RequestTime, p?: ServiceFilter) {
  return api.get<SpanKindBreakdownRow[]>(`${V1}/spans/red/span-kind-breakdown`, {
    params: range(s, e, p),
  });
}

export function getErrorsByRoute(s: RequestTime, e: RequestTime, p?: ServiceFilter) {
  return api.get<RouteErrorRow[]>(`${V1}/spans/red/errors-by-route`, {
    params: range(s, e, p),
  });
}

export function getMessagingPublishDuration(s: RequestTime, e: RequestTime, p?: ServiceFilter) {
  return api.get<{ p50?: number; p95?: number; p99?: number }>(
    `${V1}/apm/messaging-publish-duration`,
    { params: range(s, e, p) }
  );
}

export function getUptime(s: RequestTime, e: RequestTime, p?: ServiceFilter) {
  return api.get<Array<{ timestamp: string; value: number }>>(`${V1}/apm/uptime`, {
    params: range(s, e, p),
  });
}
