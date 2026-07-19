import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface ErrorGroup {
  readonly groupId: string;
  readonly serviceName: string;
  readonly operationName: string;
  readonly statusMessage: string;
  readonly httpStatusCode: number;
  readonly errorCount: number;
  readonly lastOccurrence: string;
  readonly firstOccurrence: string;
  readonly sampleTraceId: string;
}

/**
 * Group-level identity + aggregates. Per-occurrence details (stacktrace, message,
 * traceId, request context) come from {@link getErrorGroupLatestOccurrence}.
 */
export interface ErrorGroupDetail {
  readonly groupId: string;
  readonly serviceName: string;
  readonly operationName: string;
  readonly httpStatusCode: number;
  readonly errorCount: number;
  readonly lastOccurrence: string;
  readonly firstOccurrence: string;
  readonly exceptionType?: string;
}

export interface ErrorLatestOccurrence {
  readonly traceId: string;
  readonly spanId: string;
  readonly timestamp: string;
  readonly durationMs: number;
  readonly message: string;
  readonly stacktrace?: string;
  readonly httpMethod: string;
  readonly httpRoute: string;
  readonly httpStatusCode: string;
  readonly serviceVersion: string;
  readonly environment: string;
  readonly pod: string;
  readonly host: string;
}

interface ErrorFacet {
  readonly name: string;
  readonly count: number;
  readonly pct: number;
}

export interface ErrorFacetGroup {
  readonly key: string;
  readonly facets: ErrorFacet[];
}

export interface ErrorGroupTrace {
  readonly traceId: string;
  readonly spanId: string;
  readonly timestamp: string;
  readonly durationMs: number;
  readonly statusCode: string;
}

export interface ErrorTimeSeriesPoint {
  readonly serviceName: string;
  readonly timestamp: string;
  readonly requestCount: number;
  readonly errorCount: number;
}

import type { PaginatedResponse } from "@/shared/api/service-types";

interface ErrorListParams {
  serviceName?: string;
  limit?: number;
  cursor?: string;
  [key: string]: unknown;
}

function range(s: RequestTime, e: RequestTime, extra?: Record<string, unknown>) {
  return { startTime: s, endTime: e, ...extra };
}

export function listErrorGroups(
  s: RequestTime,
  e: RequestTime,
  p?: ErrorListParams
): Promise<PaginatedResponse<ErrorGroup[]>> {
  return api.get<PaginatedResponse<ErrorGroup[]>>(`${V1}/errors/groups`, {
    params: range(s, e, p),
  });
}

export function getErrorGroupDetail(
  groupId: string,
  s: RequestTime,
  e: RequestTime
): Promise<ErrorGroupDetail> {
  return api.get<ErrorGroupDetail>(`${V1}/errors/groups/${encodeURIComponent(groupId)}`, {
    params: range(s, e),
  });
}

export function getErrorGroupLatestOccurrence(
  groupId: string,
  s: RequestTime,
  e: RequestTime
): Promise<ErrorLatestOccurrence | null> {
  return api.get<ErrorLatestOccurrence | null>(
    `${V1}/errors/groups/${encodeURIComponent(groupId)}/latest-occurrence`,
    { params: range(s, e) }
  );
}

export function getErrorGroupFacets(
  groupId: string,
  s: RequestTime,
  e: RequestTime
): Promise<ErrorFacetGroup[]> {
  return api.get<ErrorFacetGroup[]>(`${V1}/errors/groups/${encodeURIComponent(groupId)}/facets`, {
    params: range(s, e),
  });
}

export function getErrorGroupTraces(
  groupId: string,
  s: RequestTime,
  e: RequestTime,
  p?: { limit?: number; cursor?: string }
): Promise<PaginatedResponse<ErrorGroupTrace[]>> {
  return api.get<PaginatedResponse<ErrorGroupTrace[]>>(
    `${V1}/errors/groups/${encodeURIComponent(groupId)}/traces`,
    { params: range(s, e, { limit: 20, ...p }) }
  );
}

export function getErrorGroupTimeseries(
  groupId: string,
  s: RequestTime,
  e: RequestTime
): Promise<ErrorTimeSeriesPoint[]> {
  return api.get<ErrorTimeSeriesPoint[]>(
    `${V1}/errors/groups/${encodeURIComponent(groupId)}/timeseries`,
    { params: range(s, e) }
  );
}

export function getErrorVolume(s: RequestTime, e: RequestTime, p?: ErrorListParams) {
  return api.get<ErrorTimeSeriesPoint[]>(`${V1}/errors/error-volume`, {
    params: range(s, e, p),
  });
}

export function getServiceErrorRate(s: RequestTime, e: RequestTime, p?: ErrorListParams) {
  return api.get<ErrorTimeSeriesPoint[]>(`${V1}/errors/service-error-rate`, {
    params: range(s, e, p),
  });
}
