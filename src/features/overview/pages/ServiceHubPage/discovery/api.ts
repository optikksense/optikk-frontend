import type { ServiceMetricPoint } from "@/features/metrics/types";
import {
  type ServiceLatestDeployment,
  deploymentsApi,
} from "@/features/overview/api/deploymentsApi";
import { getServiceMetrics } from "@/features/overview/api/serviceMetricsApi";
import type { RequestTime } from "@/shared/api/service-types";
import type { ServiceTopologyResponse } from "../topology/api";
import { getServiceTopology } from "../topology/api";

export type DiscoveryHealth = "healthy" | "degraded" | "unhealthy";
export type DeploymentRisk = "stable" | "watch" | "critical" | "unknown";

const RECENT_DEPLOYMENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface DiscoveryServiceRow {
  readonly name: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatency: number;
  readonly p50Latency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
  readonly upstreamCount: number;
  readonly downstreamCount: number;
  readonly health: DiscoveryHealth;
  readonly latestDeployment?: ServiceLatestDeployment;
  readonly deploymentRisk: DeploymentRisk;
}

function classifyHealth(errorRatePct: number): DiscoveryHealth {
  if (errorRatePct > 5) return "unhealthy";
  if (errorRatePct > 1) return "degraded";
  return "healthy";
}

function mergeRows(
  services: ServiceMetricPoint[],
  topology: ServiceTopologyResponse,
  deployments: ServiceLatestDeployment[]
): DiscoveryServiceRow[] {
  const upstream = new Map<string, number>();
  const downstream = new Map<string, number>();
  for (const edge of topology.edges) {
    downstream.set(edge.source, (downstream.get(edge.source) ?? 0) + 1);
    upstream.set(edge.target, (upstream.get(edge.target) ?? 0) + 1);
  }

  const topoHealth = new Map<string, DiscoveryHealth>();
  for (const node of topology.nodes) {
    topoHealth.set(node.name, node.health);
  }

  const deploymentByService = new Map(
    deployments.map((deployment) => [deployment.service_name.toLowerCase(), deployment] as const)
  );

  const resolveDeploymentRisk = (
    deployment: ServiceLatestDeployment | undefined,
    health: DiscoveryHealth,
    errorRate: number
  ): DeploymentRisk => {
    if (!deployment) return "unknown";
    const deployedAtMs = new Date(deployment.deployed_at).getTime();
    const isRecent =
      Number.isFinite(deployedAtMs) && Date.now() - deployedAtMs <= RECENT_DEPLOYMENT_WINDOW_MS;
    if (!isRecent) return "stable";
    if (health === "unhealthy" || errorRate > 5) return "critical";
    if (health === "degraded" || errorRate > 1) return "watch";
    return "stable";
  };

  const seen = new Set<string>();
  const rows: DiscoveryServiceRow[] = services.map((s) => {
    seen.add(s.service_name);
    const errorRate = s.request_count > 0 ? (s.error_count / s.request_count) * 100 : 0;
    const health = topoHealth.get(s.service_name) ?? classifyHealth(errorRate);
    const latestDeployment = deploymentByService.get(s.service_name.toLowerCase());
    return {
      name: s.service_name,
      requestCount: s.request_count,
      errorCount: s.error_count,
      errorRate,
      avgLatency: s.avg_latency,
      p50Latency: s.p50_latency,
      p95Latency: s.p95_latency,
      p99Latency: s.p99_latency,
      upstreamCount: upstream.get(s.service_name) ?? 0,
      downstreamCount: downstream.get(s.service_name) ?? 0,
      health,
      latestDeployment,
      deploymentRisk: resolveDeploymentRisk(latestDeployment, health, errorRate),
    };
  });

  // Include topology-only nodes (e.g., external dependencies) for completeness.
  for (const node of topology.nodes) {
    if (seen.has(node.name)) continue;
    const latestDeployment = deploymentByService.get(node.name.toLowerCase());
    rows.push({
      name: node.name,
      requestCount: node.request_count,
      errorCount: node.error_count,
      errorRate: node.error_rate,
      avgLatency: 0,
      p50Latency: node.p50_latency_ms,
      p95Latency: node.p95_latency_ms,
      p99Latency: node.p99_latency_ms,
      upstreamCount: upstream.get(node.name) ?? 0,
      downstreamCount: downstream.get(node.name) ?? 0,
      health: node.health,
      latestDeployment,
      deploymentRisk: resolveDeploymentRisk(latestDeployment, node.health, node.error_rate),
    });
  }

  return rows;
}

export async function getDiscoveryRows(
  _teamId: number | null,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DiscoveryServiceRow[]> {
  const [services, topology, deployments] = await Promise.all([
    getServiceMetrics(startTime, endTime).catch(() => [] as ServiceMetricPoint[]),
    getServiceTopology({ startTime, endTime }).catch(
      () => ({ nodes: [], edges: [] }) as ServiceTopologyResponse
    ),
    deploymentsApi.getLatestByService().catch(() => []),
  ]);
  return mergeRows(services, topology, deployments);
}
