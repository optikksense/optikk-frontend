/**
 *
 */
import { type TraceRecord as EntityTraceRecord } from '@entities/trace/model';
import type { QueryParams } from '@shared/api/service-types';

export type TraceRecord = EntityTraceRecord;

/**
 *
 */
export interface TraceColumn {
  key: string;
  label: string;
  defaultWidth?: number;
  defaultVisible?: boolean;
  flex?: boolean;
}

/**
 *
 */
export type ServiceBadge = [string, number];

// ── Trace Detail Enhancement Types ────────────────────────────────────────────

export interface SpanEvent {
  spanId: string;
  traceId: string;
  eventName: string;
  timestamp: string;
  attributes: string; // JSON string
}

export interface SpanKindDuration {
  spanKind: string;
  totalDurationMs: number;
  spanCount: number;
  pctOfTrace: number;
}

export interface CriticalPathSpan {
  spanId: string;
  operationName: string;
  serviceName: string;
  durationMs: number;
}

export interface SpanSelfTime {
  spanId: string;
  operationName: string;
  totalDurationMs: number;
  selfTimeMs: number;
  childTimeMs: number;
}

export interface ErrorPathSpan {
  spanId: string;
  parentSpanId: string;
  operationName: string;
  serviceName: string;
  status: string;
  statusMessage: string;
  startTime: string;
  durationMs: number;
}

export interface SpanAttributes {
  spanId: string;
  traceId: string;
  operationName: string;
  serviceName: string;
  attributesString: Record<string, string>;
  resourceAttributes: Record<string, string>;
  exceptionType?: string;
  exceptionMessage?: string;
  exceptionStacktrace?: string;
  dbSystem?: string;
  dbName?: string;
  dbStatement?: string;
  dbStatementNormalized?: string;
  attributes?: Record<string, string>;
}

export interface RelatedTrace {
  traceId: string;
  spanId: string;
  operationName: string;
  serviceName: string;
  durationMs: number;
  status: string;
  startTime: string;
}

// ── Analytics & Comparison Types ──────────────────────────────────────────────

export interface AnalyticsDimension {
  name: string;
  column: string;
  description?: string;
}

export interface AnalyticsQuery {
  dimensions: string[];
  metrics: string[];
  filters: Record<string, string | number | boolean | string[]>;
  startTime: number;
  endTime: number;
}

export interface TraceComparisonResult {
  traceA: {
    traceId: string;
    spanCount: number;
    durationMs: number;
    errorCount: number;
    services: number;
  };
  traceB: {
    traceId: string;
    spanCount: number;
    durationMs: number;
    errorCount: number;
    services: number;
  };
  matchedSpans: Array<{
    signature: {
      service: string;
      operation: string;
      spanKind: string;
      depth: number;
    };
    spanIdA: string;
    spanIdB: string;
    durationMsA: number;
    durationMsB: number;
    deltaMs: number;
    deltaPct: number;
    statusA: string;
    statusB: string;
    statusChanged: boolean;
  }>;
  onlyInA: Array<{
    spanId: string;
    service: string;
    operation: string;
    spanKind: string;
    durationMs: number;
    status: string;
  }>;
  onlyInB: Array<{
    spanId: string;
    service: string;
    operation: string;
    spanKind: string;
    durationMs: number;
    status: string;
  }>;
  serviceDeltas: Array<{
    service: string;
    totalMsA: number;
    totalMsB: number;
    deltaMs: number;
    spanCountA: number;
    spanCountB: number;
  }>;
  totalDeltaMs: number;
}

export interface FlamegraphNode {
  name: string;
  value: number;
  children?: FlamegraphNode[];
  metadata?: Record<string, string | number | boolean>;
}

export interface REDMetricsSummary {
  requestRate: number;
  errorRate: number;
  p95Latency: number;
  timestamp: string;
}

export interface TraceSummary {
  total_traces: number;
  error_traces: number;
  avg_duration: number;
  p50_duration: number;
  p95_duration: number;
  p99_duration: number;
}

export interface TraceFacet {
  value: string;
  count: number;
}

export interface TraceExplorerFacets {
  service_name: TraceFacet[];
  status: TraceFacet[];
  operation_name: TraceFacet[];
}

export interface TraceExplorerCorrelations {
  topServices?: TraceFacet[];
  topOperations?: TraceFacet[];
}

export interface TraceExplorerParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: string;
  services?: string[];
  minDuration?: number;
  maxDuration?: number;
  traceId?: string;
  operationName?: string;
  httpMethod?: string;
  httpStatusCode?: string | number;
  search?: string;
  mode?: string;
  spanKind?: string;
  spanName?: string;
}
