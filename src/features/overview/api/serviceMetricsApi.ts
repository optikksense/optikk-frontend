import type { EndpointMetricPoint, ServiceMetricPoint } from "@/features/metrics/types";
import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { getServiceTopology } from "@shared/components/ui/charts/ServiceTopologyGraph";

/**
 * Replaces the old `metricsOverviewApi` (which called phantom `/overview/*`
 * routes). All methods route through canonical RED + topology + routes
 * endpoints, returning the same shapes the drawer / discovery / SLO tab
 * already consume.
 */

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

interface RouteTopRow {
  readonly service_name?: string;
  readonly http_route?: string;
  readonly http_method?: string;
  readonly request_count?: number;
  readonly error_count?: number;
  readonly avg_latency_ms?: number;
  readonly p95_latency_ms?: number;
}

function range(s: RequestTime, e: RequestTime, extra?: Record<string, unknown>) {
  return { startTime: s, endTime: e, ...(extra ?? {}) };
}

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

export async function getTopEndpoints(
  s: RequestTime,
  e: RequestTime,
  serviceName?: string,
  limit = 6
): Promise<EndpointMetricPoint[]> {
  const data = await api.get<RouteTopRow[]>(`${V1}/http/routes/top-by-volume`, {
    params: range(s, e, { ...(serviceName ? { serviceName } : {}), limit }),
  });
  return (data ?? []).map((row) => ({
    service_name: row.service_name ?? "",
    operation_name: row.http_route ?? "",
    http_method: row.http_method ?? "",
    endpoint_name: row.http_route,
    request_count: Number(row.request_count ?? 0),
    error_count: Number(row.error_count ?? 0),
    avg_latency: Number(row.avg_latency_ms ?? 0),
    p50_latency: 0,
    p95_latency: Number(row.p95_latency_ms ?? 0),
    p99_latency: 0,
  }));
}
