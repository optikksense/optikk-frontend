import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import type {
  EndpointMetricPoint,
  ServiceMetricPoint,
} from "@/features/metrics/types";
import { API_CONFIG } from "@config/apiConfig";

import { getServiceTopology } from "../pages/ServiceHubPage/topology/api";

/**
 * Replaces the old `metricsOverviewApi` (which called phantom `/overview/*`
 * routes). All methods route through canonical RED + topology + routes
 * endpoints, returning the same shapes the drawer / discovery / SLO tab
 * already consume.
 */

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface RequestRatePoint {
  readonly timestamp: string;
  readonly requestCount: number;
}

export interface ErrorRatePoint {
  readonly timestamp: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
}

export interface P95LatencyPoint {
  readonly timestamp: string;
  readonly p95: number;
}

interface ServerRatePoint {
  readonly timestamp?: string;
  readonly service_name?: string;
  readonly rps?: number;
}

interface ServerLatencyPoint {
  readonly timestamp?: string;
  readonly service_name?: string;
  readonly p95_ms?: number;
}

interface ServerErrorPoint {
  readonly timestamp?: string;
  readonly service_name?: string;
  readonly request_count?: number;
  readonly error_count?: number;
  readonly error_rate?: number;
}

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

export async function getRequestRateTimeseries(
  s: RequestTime,
  e: RequestTime,
  serviceName?: string
): Promise<RequestRatePoint[]> {
  const data = await api.get<ServerRatePoint[]>(`${V1}/spans/red/request-rate`, {
    params: range(s, e, serviceName ? { serviceName } : undefined),
  });
  return (data ?? []).map((p) => ({
    timestamp: p.timestamp ?? "",
    requestCount: Math.round(Number(p.rps ?? 0) * 60),
  }));
}

export async function getErrorRateTimeseries(
  s: RequestTime,
  e: RequestTime,
  serviceName?: string
): Promise<ErrorRatePoint[]> {
  const data = await api.get<ServerErrorPoint[]>(`${V1}/errors/service-error-rate`, {
    params: range(s, e, serviceName ? { serviceName } : undefined),
  });
  return (data ?? []).map((p) => ({
    timestamp: p.timestamp ?? "",
    requestCount: Number(p.request_count ?? 0),
    errorCount: Number(p.error_count ?? 0),
    errorRate: Number(p.error_rate ?? 0),
  }));
}

export async function getP95LatencyTimeseries(
  s: RequestTime,
  e: RequestTime,
  serviceName?: string
): Promise<P95LatencyPoint[]> {
  const data = await api.get<ServerLatencyPoint[]>(`${V1}/spans/red/p95-latency`, {
    params: range(s, e, serviceName ? { serviceName } : undefined),
  });
  return (data ?? []).map((p) => ({
    timestamp: p.timestamp ?? "",
    p95: Number(p.p95_ms ?? 0),
  }));
}

export async function getTopEndpoints(
  s: RequestTime,
  e: RequestTime,
  serviceName?: string,
  limit = 6
): Promise<EndpointMetricPoint[]> {
  const data = await api.get<RouteTopRow[]>(`${V1}/routes/top-by-volume`, {
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
