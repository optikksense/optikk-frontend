import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface ErrorGroup {
  readonly group_id: string;
  readonly service_name: string;
  readonly operation_name: string;
  readonly status_message: string;
  readonly http_status_code: number;
  readonly error_count: number;
  readonly last_occurrence: string;
  readonly first_occurrence: string;
  readonly sample_trace_id: string;
}

export interface ErrorGroupDetail extends ErrorGroup {
  readonly stack_trace?: string;
  readonly exception_type?: string;
}

export interface ErrorGroupTrace {
  readonly trace_id: string;
  readonly span_id: string;
  readonly timestamp: string;
  readonly duration_ms: number;
  readonly status_code: string;
}

export interface ErrorTimeSeriesPoint {
  readonly service_name: string;
  readonly timestamp: string;
  readonly request_count: number;
  readonly error_count: number;
}

interface ErrorListParams {
  serviceName?: string;
  limit?: number;
}

function range(s: RequestTime, e: RequestTime, extra?: Record<string, unknown>) {
  return { startTime: s, endTime: e, ...extra };
}

export function listErrorGroups(
  s: RequestTime,
  e: RequestTime,
  p?: ErrorListParams
): Promise<ErrorGroup[]> {
  return api.get<ErrorGroup[]>(`${V1}/errors/groups`, { params: range(s, e, p as Record<string, unknown> | undefined) });
}

export function getErrorGroupDetail(groupId: string): Promise<ErrorGroupDetail> {
  return api.get<ErrorGroupDetail>(`${V1}/errors/groups/${encodeURIComponent(groupId)}`);
}

export function getErrorGroupTraces(
  groupId: string,
  s: RequestTime,
  e: RequestTime,
  limit = 50
): Promise<ErrorGroupTrace[]> {
  return api.get<ErrorGroupTrace[]>(
    `${V1}/errors/groups/${encodeURIComponent(groupId)}/traces`,
    { params: range(s, e, { limit }) }
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
  return api.get<ErrorTimeSeriesPoint[]>(`${V1}/errors/error-volume`, { params: range(s, e, p as Record<string, unknown> | undefined) });
}

export function getServiceErrorRate(s: RequestTime, e: RequestTime, p?: ErrorListParams) {
  return api.get<ErrorTimeSeriesPoint[]>(`${V1}/errors/service-error-rate`, {
    params: range(s, e, p as Record<string, unknown> | undefined),
  });
}
