import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

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
