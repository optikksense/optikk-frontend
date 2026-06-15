import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

type DetailParams = Record<string, RequestTime | string | number | undefined>;

function buildParams(
  s: RequestTime,
  e: RequestTime,
  serviceName: string,
  extra?: DetailParams
): DetailParams {
  const p: DetailParams = { startTime: s, endTime: e, ...extra };
  if (serviceName) p.serviceName = serviceName;
  return p;
}

async function getJson<T>(path: string, params: DetailParams): Promise<T> {
  const raw = await api.get<unknown>(`${V1}${path}`, { params });
  return unwrapEnvelope<T>(raw);
}

export interface StatusTimeseriesPoint {
  readonly timestamp: string;
  readonly status_2xx: number;
  readonly status_4xx: number;
  readonly status_5xx: number;
  readonly status_other: number;
}

export interface LatencyPercentilesPoint {
  readonly timestamp: string;
  readonly p50_ms: number;
  readonly p95_ms: number;
  readonly p99_ms: number;
}

export interface TopEndpoint {
  readonly operation_name: string;
  readonly service_name: string;
  readonly span_kind: string;
  readonly http_route: string;
  readonly rps: number;
  readonly error_rate: number;
  readonly error_count: number;
  readonly total_count: number;
  readonly p50_ms: number;
  readonly p95_ms: number;
  readonly p99_ms: number;
}

export interface PageInfo {
  readonly hasMore: boolean;
  readonly nextCursor?: string;
  readonly limit: number;
}

export interface PaginatedResponse<T> {
  readonly results: T;
  readonly pageInfo: PageInfo;
}

export interface ComparisonPayload<T> {
  readonly data: T;
  readonly comparison?: T;
}

export function getStatusTimeseries(
  s: RequestTime,
  e: RequestTime,
  serviceName: string
): Promise<StatusTimeseriesPoint[]> {
  return getJson("/spans/red/status-timeseries", buildParams(s, e, serviceName));
}

export function getLatencyPercentilesTimeseries(
  s: RequestTime,
  e: RequestTime,
  serviceName: string
): Promise<LatencyPercentilesPoint[]> {
  return getJson("/spans/red/latency-percentiles-timeseries", buildParams(s, e, serviceName));
}

export function getTopEndpoints(
  s: RequestTime,
  e: RequestTime,
  serviceName: string,
  limit = 50,
  compareTo?: "previous_period",
  cursor?: string
): Promise<ComparisonPayload<PaginatedResponse<TopEndpoint[]>>> {
  const params = buildParams(s, e, serviceName, { limit, cursor });
  if (compareTo) params.compareTo = compareTo;
  return api
    .get<unknown>(`${V1}/spans/red/top-endpoints`, { params })
    .then((raw) => raw as ComparisonPayload<PaginatedResponse<TopEndpoint[]>>);
}

export interface ServiceSummaryResponse {
  readonly service_name: string;
  readonly request_count: number;
  readonly error_count: number;
  readonly rps: number;
  readonly error_rate: number;
  readonly p50_ms: number;
  readonly p95_ms: number;
  readonly p99_ms: number;
  readonly cpu_utilization: number;
  readonly memory_utilization: number;
  readonly disk_utilization: number;
}

export interface SaturationTimeSeriesPoint {
  readonly timestamp: string;
  readonly value: number;
}

export function getServiceSummary(
  s: RequestTime,
  e: RequestTime,
  serviceName: string,
  compareTo?: "previous_period"
): Promise<ComparisonPayload<ServiceSummaryResponse>> {
  const params = buildParams(s, e, "", { compareTo });
  return api
    .get<unknown>(`${V1}/spans/red/services/${encodeURIComponent(serviceName)}/summary`, { params })
    .then((raw) => raw as ComparisonPayload<ServiceSummaryResponse>);
}

export function getServiceSaturationTimeseries(
  s: RequestTime,
  e: RequestTime,
  serviceName: string
): Promise<SaturationTimeSeriesPoint[]> {
  const params = buildParams(s, e, "");
  return getJson<SaturationTimeSeriesPoint[]>(
    `/spans/red/services/${encodeURIComponent(serviceName)}/saturation-timeseries`,
    params
  );
}
