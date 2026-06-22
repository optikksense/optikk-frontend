import type { ServiceMetricPoint } from "@/features/metrics/types";
import type { RequestTime } from "@/shared/api/service-types";
import { getServiceTopology } from "@shared/components/ui/charts/ServiceTopologyGraph";

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
    service_name: node.name,
    request_count: node.request_count,
    error_count: node.error_count,
    avg_latency: node.p50_latency_ms,
    p50_latency: node.p50_latency_ms,
    p95_latency: node.p95_latency_ms,
    p99_latency: node.p99_latency_ms,
  }));
}
