import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";
import { buildREDFilters, type REDFiltersParams } from "./buildREDFilters";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

// ─── Shared helpers ──────────────────────────────────────────────────

async function getJson<T>(path: string, params: REDFiltersParams): Promise<T> {
  const raw = await api.get<unknown>(`${V1}${path}`, { params });
  return unwrapEnvelope<T>(raw);
}

// ─── Topology (unchanged) ────────────────────────────────────────────

export interface ServiceNode {
  readonly name: string;
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly p50_latency_ms: number;
  readonly p95_latency_ms: number;
  readonly p99_latency_ms: number;
  readonly health: string;
}

export interface ServiceEdge {
  readonly source: string;
  readonly target: string;
  readonly call_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly p50_latency_ms: number;
  readonly p95_latency_ms: number;
}

export interface TopologyResponse {
  readonly nodes: ServiceNode[];
  readonly edges: ServiceEdge[];
}

export function getTopology(
  s: RequestTime,
  e: RequestTime,
  service?: string
): Promise<TopologyResponse> {
  const params: Record<string, RequestTime | string> = { startTime: s, endTime: e };
  if (service) params.service = service;
  return api.get<TopologyResponse>(`${V1}/services/topology`, { params });
}

// ─── Fleet overview / catalog ────────────────────────────────────────

export interface RedServiceRow {
  readonly service_name: string;
  readonly request_count: number;
  readonly error_count: number;
  readonly avg_latency: number;
  readonly p95_latency: number;
  readonly p99_latency: number;
}

export interface ServiceCatalogRedSummary {
  readonly service_count: number;
  readonly total_span_count: number;
  readonly total_errors: number;
  readonly total_rps: number;
  readonly avg_error_pct: number;
  readonly avg_p50_ms: number;
  readonly avg_p95_ms: number;
  readonly avg_p99_ms: number;
  readonly services: RedServiceRow[];
}

export interface RedSummaryWithComparison {
  readonly data: ServiceCatalogRedSummary;
  readonly comparison?: ServiceCatalogRedSummary;
}

export async function getRedSummaryWithComparison(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[]
): Promise<RedSummaryWithComparison> {
  const params = buildREDFilters(s, e, services);
  const overview = await api.get<{ totals: Omit<ServiceCatalogRedSummary, "services">; services: RedServiceRow[] }>(
    `${V1}/spans/red/fleet-overview`,
    { params }
  );
  return { data: { ...overview.totals, services: overview.services } };
}

export interface RequestRatePoint {
  readonly timestamp: string;
  readonly service_name: string;
  readonly rps: number;
}

export async function getRequestRateSeries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[]
): Promise<RequestRatePoint[]> {
  const params = buildREDFilters(s, e, services);
  const raw = await api.get<unknown>(`${V1}/spans/red/request-rate`, { params });
  return unwrapEnvelope<RequestRatePoint[]>(raw);
}

// ─── Shared RED timeseries (fleet-wide or per-service) ───────────────

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

export interface EndpointRatePoint {
  readonly timestamp: string;
  readonly http_route: string;
  readonly rps: number;
  // null for buckets with no traffic, so the chart breaks the line.
  readonly error_rate: number | null;
  readonly p99_ms: number | null;
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

export interface TopDBQuery {
  readonly operation_name: string;
  readonly service_name: string;
  readonly db_system: string;
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
  services?: string | readonly string[]
): Promise<StatusTimeseriesPoint[]> {
  return getJson("/spans/red/status-timeseries", buildREDFilters(s, e, services));
}

export function getREDByEndpoint(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[]
): Promise<EndpointRatePoint[]> {
  return getJson("/spans/red/red-by-endpoint", buildREDFilters(s, e, services));
}

export function getLatencyPercentilesTimeseries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[]
): Promise<LatencyPercentilesPoint[]> {
  return getJson("/spans/red/latency-percentiles-timeseries", buildREDFilters(s, e, services));
}

export function getTopEndpoints(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  limit = 50,
  compareTo?: "previous_period",
  cursor?: string
): Promise<ComparisonPayload<PaginatedResponse<TopEndpoint[]>>> {
  const params = buildREDFilters(s, e, services, { limit, cursor });
  if (compareTo) {
    (params as any).compareTo = compareTo;
  }
  return api
    .get<unknown>(`${V1}/spans/red/top-endpoints`, { params })
    .then((raw) => raw as ComparisonPayload<PaginatedResponse<TopEndpoint[]>>);
}

export function getTopDBQueries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  limit = 50,
  compareTo?: "previous_period",
  cursor?: string
): Promise<ComparisonPayload<PaginatedResponse<TopDBQuery[]>>> {
  const params = buildREDFilters(s, e, services, { limit, cursor });
  if (compareTo) {
    (params as any).compareTo = compareTo;
  }
  return api
    .get<unknown>(`${V1}/spans/red/top-db-queries`, { params })
    .then((raw) => raw as ComparisonPayload<PaginatedResponse<TopDBQuery[]>>);
}

// ─── Service Detail (consolidated from serviceDetailApi.ts) ───────────

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
  services: string | readonly string[],
  compareTo?: "previous_period"
): Promise<ComparisonPayload<ServiceSummaryResponse>> {
  const params = buildREDFilters(s, e, services, { compareTo });
  return api
    .get<unknown>(`${V1}/spans/red/summary`, { params })
    .then((raw) => raw as ComparisonPayload<ServiceSummaryResponse>);
}

export function getServiceSaturationTimeseries(
  s: RequestTime,
  e: RequestTime,
  services: string | readonly string[]
): Promise<SaturationTimeSeriesPoint[]> {
  const params = buildREDFilters(s, e, services);
  return getJson<SaturationTimeSeriesPoint[]>("/spans/red/saturation-timeseries", params);
}
