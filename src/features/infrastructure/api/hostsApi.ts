import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

import type { FleetPod } from "../types";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type HostStatus = "healthy" | "warn" | "error";

// Host is the unified row from GET /infrastructure/hosts. The saturation fields
// are always present; the RED traffic fields are populated only when the request
// is scoped to a service.
export interface Host {
  readonly host: string;
  readonly subsystem: string; // "kafka" | "database" | "other"
  readonly cpu: number;
  readonly mem: number;
  readonly disk: number;
  readonly saturation: number;
  readonly tone: string; // "ok" | "warn" | "err"
  readonly zone?: string;
  readonly rps?: number;
  readonly error_rate?: number;
  readonly p99_ms?: number;
  readonly status?: HostStatus;
  readonly last_seen?: string;
  readonly request_count?: number;
  readonly error_count?: number;
}

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

// getHosts returns the fleet host-saturation list, or — when serviceName is
// given — the hosts running that service enriched with RED traffic.
export function getHosts(
  s: RequestTime,
  e: RequestTime,
  serviceName?: string
): Promise<Host[]> {
  return api.get<Host[]>(`${V1}/infrastructure/hosts`, {
    params: serviceName ? { ...range(s, e), service: serviceName } : range(s, e),
  });
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
