import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

import type { FleetPod } from "../types";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface InfrastructureNode {
  readonly host: string;
  readonly pod_count: number;
  readonly container_count: number;
  readonly services: readonly string[];
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly avg_latency_ms: number;
  readonly p95_latency_ms: number;
  readonly last_seen: string;
}

export interface InfrastructureNodeService {
  readonly service_name: string;
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly avg_latency_ms: number;
  readonly p95_latency_ms: number;
  readonly pod_count: number;
}

export interface InfrastructureNodeSummary {
  readonly healthy_nodes: number;
  readonly degraded_nodes: number;
  readonly unhealthy_nodes: number;
  readonly total_pods: number;
}

function range(s: RequestTime, e: RequestTime) {
  return { startTime: s, endTime: e };
}

export function getNodes(s: RequestTime, e: RequestTime): Promise<InfrastructureNode[]> {
  return api.get<InfrastructureNode[]>(`${V1}/infrastructure/nodes`, { params: range(s, e) });
}

export function getNodesSummary(
  s: RequestTime,
  e: RequestTime
): Promise<InfrastructureNodeSummary> {
  return api.get<InfrastructureNodeSummary>(`${V1}/infrastructure/nodes/summary`, {
    params: range(s, e),
  });
}

export function getNodeServices(
  host: string,
  s: RequestTime,
  e: RequestTime
): Promise<InfrastructureNodeService[]> {
  return api.get<InfrastructureNodeService[]>(
    `${V1}/infrastructure/nodes/${encodeURIComponent(host)}/services`,
    { params: range(s, e) }
  );
}

export async function getFleetPods(s: RequestTime, e: RequestTime): Promise<FleetPod[]> {
  const data = await api.get<FleetPod[]>(`${V1}/infrastructure/fleet/pods`, {
    params: range(s, e),
  });
  return Array.isArray(data) ? data : [];
}
