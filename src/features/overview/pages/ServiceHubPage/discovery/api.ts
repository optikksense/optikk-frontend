import type { ServiceTopologyResponse } from "../topology/api";
import { fetchServiceTopology } from "../topology/api";
import { metricsOverviewApi } from "@/features/metrics/api/metricsOverviewApi";
import type { RequestTime } from "@/shared/api/service-types";
import type { ServiceMetricPoint } from "@/features/metrics/types";

export type DiscoveryHealth = "healthy" | "degraded" | "unhealthy";

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
}

function classifyHealth(errorRatePct: number): DiscoveryHealth {
  if (errorRatePct > 5) return "unhealthy";
  if (errorRatePct > 1) return "degraded";
  return "healthy";
}

function mergeRows(
  services: ServiceMetricPoint[],
  topology: ServiceTopologyResponse
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

  const seen = new Set<string>();
  const rows: DiscoveryServiceRow[] = services.map((s) => {
    seen.add(s.service_name);
    const errorRate =
      s.request_count > 0 ? (s.error_count / s.request_count) * 100 : 0;
    const health = topoHealth.get(s.service_name) ?? classifyHealth(errorRate);
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
    };
  });

  // Include topology-only nodes (e.g., external dependencies) for completeness.
  for (const node of topology.nodes) {
    if (seen.has(node.name)) continue;
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
    });
  }

  return rows;
}

export async function fetchDiscoveryRows(
  teamId: number | null,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DiscoveryServiceRow[]> {
  const [services, topology] = await Promise.all([
    metricsOverviewApi.getOverviewServiceMetrics(teamId, startTime, endTime),
    fetchServiceTopology({ startTime, endTime }),
  ]);
  return mergeRows(services, topology);
}
