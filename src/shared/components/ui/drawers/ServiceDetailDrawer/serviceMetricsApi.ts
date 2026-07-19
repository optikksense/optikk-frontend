import type { RequestTime } from "@/shared/api/service-types";
import { getServiceTopology } from "@shared/api/topology";
import type { ServiceMetricPoint } from "@shared/metrics/types";

/**
 * Replaces the old `metricsOverviewApi` (which called phantom `/overview/*`
 * routes). All methods route through canonical RED + topology + routes
 * endpoints, returning the same shapes the drawer / discovery / SLO tab
 * already consume.
 */

export async function getServiceMetrics(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<ServiceMetricPoint[]> {
  const topology = await getServiceTopology({ startTime, endTime });
  return topology.nodes.map((node) => ({
    serviceName: node.name,
    requestCount: node.requestCount,
    errorCount: node.errorCount,
    avgLatency: node.p50LatencyMs,
    p50Latency: node.p50LatencyMs,
    p95Latency: node.p95LatencyMs,
    p99Latency: node.p99LatencyMs,
  }));
}
