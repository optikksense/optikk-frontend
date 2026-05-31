import type { SpanDetailTab } from "../../store/tracesStore";
import type { SpanAttributes, SpanEvent } from "../../types";

interface SpanLike {
  start_time?: string | number | null;
  end_time?: string | number | null;
}

export interface TraceTimeBounds {
  startMs?: number;
  endMs?: number;
}

/**
 * Scans the span list once to find the min start_time and max end_time in
 * millis. Invalid/missing timestamps are skipped, not treated as zero.
 */
export function computeTraceTimeBounds(spans: readonly SpanLike[]): TraceTimeBounds {
  if (spans.length === 0) return { startMs: undefined, endMs: undefined };

  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;

  for (const span of spans) {
    const start = span.start_time ? new Date(span.start_time).getTime() : Number.NaN;
    const end = span.end_time ? new Date(span.end_time).getTime() : Number.NaN;
    if (Number.isFinite(start) && start < minStart) minStart = start;
    if (Number.isFinite(end) && end > maxEnd) maxEnd = end;
  }

  return {
    startMs: Number.isFinite(minStart) ? minStart : undefined,
    endMs: Number.isFinite(maxEnd) ? maxEnd : undefined,
  };
}

interface TabAvailability {
  readonly hasEvents: boolean;
  readonly hasLinks: boolean;
}

export function detectTabAvailability(
  attrs: SpanAttributes | null,
  events: readonly SpanEvent[],
  selectedSpanId: string | null
): TabAvailability {
  const hasLinks = (attrs?.links?.length ?? 0) > 0;
  const hasEvents = !!selectedSpanId && events.some((e) => e.spanId === selectedSpanId);
  return { hasEvents, hasLinks };
}

/** The span drawer always opens on Overview. */
export function getDefaultDetailTab(): SpanDetailTab {
  return "overview";
}
