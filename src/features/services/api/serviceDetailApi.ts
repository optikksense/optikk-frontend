import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

type DetailParams = Record<string, RequestTime | string | number | undefined>;

function unwrap<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }
  const record = value as Record<string, unknown>;
  if ("data" in record && Object.keys(record).length <= 2) {
    return record.data as T;
  }
  return value as T;
}

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
  return unwrap<T>(raw);
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
  compareTo?: "previous_period"
): Promise<ComparisonPayload<TopEndpoint[]>> {
  const params = buildParams(s, e, serviceName, { limit });
  if (compareTo) params.compareTo = compareTo;
  return api
    .get<unknown>(`${V1}/spans/red/top-endpoints`, { params })
    .then((raw) => raw as ComparisonPayload<TopEndpoint[]>);
}
