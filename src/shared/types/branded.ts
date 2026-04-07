/**
 * Branded Types for strong typing of identifiers.
 * Aligned with Zod's internal branding for maximum compatibility.
 */

declare const __brand: unique symbol;

export type Brand<T, TBrand extends string> = T;

export type UserId = Brand<string | number, 'UserId'>;
export type TeamId = Brand<number, 'TeamId'>;
export type TraceId = Brand<string, 'TraceId'>;
export type SpanId = Brand<string, 'SpanId'>;
export type MetricId = Brand<string, 'MetricId'>;

/**
 * Utility to cast to a branded type.
 * Use this only at the boundaries (e.g. when receiving data from API).
 */
export function asUserId(id: string | number): UserId {
  return id as UserId;
}
export function asTeamId(id: number): TeamId {
  return id as TeamId;
}
export function asTraceId(id: string): TraceId {
  return id as TraceId;
}
export function asSpanId(id: string): SpanId {
  return id as SpanId;
}
export function asMetricId(id: string): MetricId {
  return id as MetricId;
}

