export type {
  TraceSummary,
  TraceCursor,
  TracesQueryRequest,
  TracesFacetBucket,
  TracesQueryResponse,
} from "./trace";

export type { TraceRecord } from "@shared/api/schemas/tracesSchemas";

export interface SpanEvent {
  readonly spanId: string;
  readonly traceId: string;
  readonly eventName: string;
  readonly timestamp: string;
  readonly attributes: string;
}

export interface SpanKindDuration {
  readonly spanKind: string;
  readonly totalDurationMs: number;
  readonly spanCount: number;
  readonly pctOfTrace: number;
}

export interface SpanSelfTime {
  readonly spanId: string;
  readonly operationName: string;
  readonly totalDurationMs: number;
  readonly selfTimeMs: number;
  readonly childTimeMs: number;
}

export interface SpanAttributes {
  readonly spanId: string;
  readonly traceId: string;
  readonly operationName: string;
  readonly serviceName: string;
  readonly attributesString: Record<string, string>;
  readonly resourceAttributes: Record<string, string>;
  readonly exceptionType?: string;
  readonly exceptionMessage?: string;
  readonly exceptionStacktrace?: string;
  readonly dbSystem?: string;
  readonly dbName?: string;
  readonly dbStatement?: string;
  readonly dbStatementNormalized?: string;
  readonly attributes: Record<string, string>;
}

export interface RelatedTrace {
  readonly traceId: string;
  readonly spanId: string;
  readonly operationName: string;
  readonly serviceName: string;
  readonly durationMs: number;
  readonly status: string;
  readonly startTime: string;
}

export interface CriticalPathSpan {
  readonly spanId: string;
  readonly operationName: string;
  readonly serviceName: string;
  readonly durationMs: number;
}

export interface ErrorPathSpan {
  readonly spanId: string;
  readonly parentSpanId: string;
  readonly operationName: string;
  readonly serviceName: string;
  readonly status: string;
  readonly statusMessage: string;
  readonly startTime: string;
  readonly durationMs: number;
}

export interface FlamegraphNode {
  name: string;
  value: number;
  metadata?: {
    readonly span_id: string;
    readonly self_time_ms?: number;
    readonly has_error?: boolean;
  };
  children?: FlamegraphNode[];
}
