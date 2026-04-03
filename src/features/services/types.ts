/**
 * Base record type for domain data
 */
export type DomainRecord = Record<string, unknown>;

// ── Service Overview Stats ──────────────────────────────────────

export interface ServiceOverviewStats {
  serviceName: string;
  requestCount: number;
  errorCount: number;
  errorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  healthStatus: 'healthy' | 'degraded' | 'critical';
}

// ── Time Series ─────────────────────────────────────────────────

export interface ServiceTimeSeriesPoint {
  timestamp: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

// ── Endpoints ───────────────────────────────────────────────────

export interface ServiceEndpoint {
  serviceName: string;
  operationName: string;
  httpMethod: string;
  requestCount: number;
  errorCount: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
}

// ── Errors ──────────────────────────────────────────────────────

export interface ServiceErrorGroup {
  serviceName: string;
  operationName: string;
  statusMessage: string;
  httpStatusCode: number;
  errorCount: number;
  lastOccurrence: string;
  firstOccurrence: string;
  sampleTraceId: string;
}

// ── Dependencies ────────────────────────────────────────────────

export interface ServiceDependencyDetail {
  source: string;
  target: string;
  callCount: number;
  p95LatencyMs: number;
  errorRate: number;
  direction: 'upstream' | 'downstream';
}

// ── Span Analysis ───────────────────────────────────────────────

export interface SpanAnalysisEntry {
  spanKind: string;
  operationName: string;
  spanCount: number;
  totalDurationMs: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errorCount: number;
  errorRate: number;
}

// ── Infrastructure ──────────────────────────────────────────────

export interface ServiceInfraMetrics {
  serviceName: string;
  avgCpuUtil: number;
  avgMemoryUtil: number;
  avgDiskUtil: number;
  avgNetworkUtil: number;
  avgConnPoolUtil: number;
  sampleCount: number;
}

// ── Health thresholds (match backend otel_conventions.go) ───────

export const HEALTH_THRESHOLDS = {
  HEALTHY_MAX_ERROR_RATE: 1.0,
  DEGRADED_MAX_ERROR_RATE: 5.0,
} as const;

export function deriveHealthStatus(errorRate: number): ServiceOverviewStats['healthStatus'] {
  if (errorRate <= HEALTH_THRESHOLDS.HEALTHY_MAX_ERROR_RATE) return 'healthy';
  if (errorRate <= HEALTH_THRESHOLDS.DEGRADED_MAX_ERROR_RATE) return 'degraded';
  return 'critical';
}

export function healthStatusColor(status: ServiceOverviewStats['healthStatus']): string {
  switch (status) {
    case 'healthy':
      return 'var(--color-success, #35d68f)';
    case 'degraded':
      return 'var(--color-warning, #f7b63a)';
    case 'critical':
      return 'var(--color-error, #ff4d5a)';
  }
}
