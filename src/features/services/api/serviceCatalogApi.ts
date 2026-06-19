import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

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
  e: RequestTime
): Promise<RedSummaryWithComparison> {
  const params = { startTime: s, endTime: e };
  const [totals, services] = await Promise.all([
    api.get<Omit<ServiceCatalogRedSummary, "services">>(`${V1}/spans/red/fleet-totals`, { params }),
    api.get<RedServiceRow[]>(`${V1}/spans/red/services`, { params }),
  ]);
  return { data: { ...totals, services } };
}

export interface RequestRatePoint {
  readonly timestamp: string;
  readonly service_name: string;
  readonly rps: number;
}

export async function getRequestRateSeries(
  s: RequestTime,
  e: RequestTime
): Promise<RequestRatePoint[]> {
  const raw = await api.get<unknown>(`${V1}/spans/red/request-rate`, {
    params: { startTime: s, endTime: e },
  });
  return unwrapEnvelope<RequestRatePoint[]>(raw);
}
