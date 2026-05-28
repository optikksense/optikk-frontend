import type { ErrorTimeSeriesPoint } from "@/features/errors/api/errorGroupsApi";
import type { ServiceTopologyEdge } from "@/features/overview/pages/ServiceHubPage/topology/api";
import type {
  LatencyPercentilesPoint,
  StatusTimeseriesPoint,
} from "@/features/services/api/serviceDetailApi";

import type { DependencyRow, EndpointRow, ServiceSummarySnapshot } from "./types";

export function normalizeServiceKey(value: string): string {
  return value.trim().toLowerCase();
}

export function readNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function buildInitialSummary(
  data: Record<string, unknown> | null | undefined
): ServiceSummarySnapshot | null {
  if (!data) {
    return null;
  }

  const requestCount = readNumber(data.request_count) ?? 0;
  const errorCount = readNumber(data.error_count) ?? 0;
  const explicitErrorRate = readNumber(data.error_rate);

  return {
    requestCount,
    errorCount,
    errorRate: explicitErrorRate ?? (requestCount > 0 ? (errorCount * 100) / requestCount : 0),
    avgLatency: readNumber(data.avg_latency) ?? 0,
    p95Latency: readNumber(data.p95_latency) ?? 0,
    p99Latency: readNumber(data.p99_latency) ?? 0,
  };
}

export function buildDependencyRows(
  edges: readonly ServiceTopologyEdge[],
  serviceName: string,
  direction: "upstream" | "downstream"
): DependencyRow[] {
  const normalizedServiceName = normalizeServiceKey(serviceName);

  return edges
    .filter((edge) =>
      direction === "upstream"
        ? normalizeServiceKey(edge.target) === normalizedServiceName
        : normalizeServiceKey(edge.source) === normalizedServiceName
    )
    .sort((left, right) => Number(right.call_count ?? 0) - Number(left.call_count ?? 0))
    .slice(0, 6)
    .map((edge) => ({
      id: `${direction}:${edge.source}->${edge.target}`,
      serviceName: direction === "upstream" ? edge.source : edge.target,
      callCount: Number(edge.call_count ?? 0),
      p95LatencyMs: Number(edge.p95_latency_ms ?? 0),
    }));
}

export function buildLatencyTrendSeries(points: readonly LatencyPercentilesPoint[]) {
  return points.map((point) => ({
    timestamp: point.timestamp,
    p50_ms: point.p50_ms,
    p95_ms: point.p95_ms,
    p99_ms: point.p99_ms,
    p95: point.p95_ms, // for sparkline compatibility
  }));
}

export function buildRequestTrendSeries(points: readonly StatusTimeseriesPoint[]) {
  return points.map((point) => {
    const total =
      (point.status_2xx ?? 0) +
      (point.status_4xx ?? 0) +
      (point.status_5xx ?? 0) +
      (point.status_other ?? 0);
    return {
      timestamp: point.timestamp,
      request_count: total,
    };
  });
}

export function buildErrorTrendSeries(points: readonly ErrorTimeSeriesPoint[]) {
  return points.map((point) => {
    const requests = point.request_count ?? 0;
    const errors = point.error_count ?? 0;
    return {
      timestamp: point.timestamp,
      request_count: requests,
      error_count: errors,
      error_rate: requests > 0 ? (errors / requests) * 100 : 0,
    };
  });
}

export function healthVariantForErrorRate(
  errorRate: number | undefined
): "success" | "warning" | "error" {
  const rate = Number(errorRate ?? 0);
  if (rate > 5) return "error";
  if (rate > 1) return "warning";
  return "success";
}

export function healthLabelForErrorRate(errorRate: number | undefined): string {
  const rate = Number(errorRate ?? 0);
  if (rate > 5) return "unhealthy";
  if (rate > 1) return "degraded";
  return "healthy";
}

export function formatEndpointLabel(
  row: Pick<EndpointRow, "endpoint_name" | "operation_name">
): string {
  const endpointName = row.endpoint_name?.trim();
  const operationName = row.operation_name.trim();

  if (endpointName) {
    return endpointName;
  }

  if (operationName && !operationName.startsWith("/")) {
    return operationName;
  }

  return operationName || "Route unavailable";
}

export function formatEndpointMeta(
  row: Pick<EndpointRow, "endpoint_name" | "operation_name">
): string | null {
  const endpointName = row.endpoint_name?.trim();
  const operationName = row.operation_name.trim();

  if (endpointName && operationName && endpointName !== operationName) {
    return `Span: ${operationName}`;
  }

  if (!endpointName && operationName) {
    return operationName === formatEndpointLabel(row)
      ? "Route label unavailable in spans"
      : `Span: ${operationName}`;
  }

  return null;
}
