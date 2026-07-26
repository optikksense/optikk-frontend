import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

import type { FleetPod } from "../types";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface InfrastructureNode {
  readonly host: string;
  readonly podCount: number;
  readonly containerCount: number;
  readonly services: readonly string[];
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatencyMs: number;
  readonly p95LatencyMs: number;
  readonly lastSeen: string;
}

export interface InfrastructureNodeService {
  readonly serviceName: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatencyMs: number;
  readonly p95LatencyMs: number;
  readonly podCount: number;
}

export interface InfrastructureNodeSummary {
  readonly healthyNodes: number;
  readonly degradedNodes: number;
  readonly unhealthyNodes: number;
  readonly totalPods: number;
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

export async function getFleetPods(
  s: RequestTime,
  e: RequestTime,
  host?: string
): Promise<FleetPod[]> {
  const data = await api.get<FleetPod[]>(`${V1}/infrastructure/fleet/pods`, {
    params: host ? { ...range(s, e), host } : range(s, e),
  });
  return Array.isArray(data) ? data : [];
}
