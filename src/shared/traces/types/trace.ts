import type { TraceRecord } from "@shared/api/traces/schemas";
import type { SpanAttributes } from "./detail";

export interface TraceTimeBounds {
  readonly startMs: number;
  readonly endMs: number;
}

export interface TraceStats {
  readonly totalSpans: number;
  readonly errors: number;
  readonly services: Set<string>;
  readonly durationMs: number;
}

export interface UnifiedTrace {
  readonly traceId: string;
  readonly spans: readonly TraceRecord[];
  readonly stats: TraceStats;
  readonly traceTimeBounds: TraceTimeBounds;
}

export interface SharedLlmTraceData {
  readonly traceId: string;
  readonly spans: readonly TraceRecord[];
  readonly stats: TraceStats;
  readonly traceTimeBounds: TraceTimeBounds;
  readonly getSpanAttributes: (spanId: string) => SpanAttributes | null;
}
