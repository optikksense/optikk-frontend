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
  readonly hasLogs: boolean;
  readonly hasEvents: boolean;
  readonly hasLinks: boolean;
  readonly hasInfra: boolean;
}

const INFRA_KEY_PATTERNS = [
  "host.",
  "k8s.",
  "cloud.",
  "container.",
  "service.version",
  "deployment.environment",
];

export function detectTabAvailability(
  attrs: SpanAttributes | null,
  events: readonly SpanEvent[],
  selectedSpanId: string | null,
  spanScopedLogsCount: number
): TabAvailability {
  const ra = attrs?.resourceAttributes ?? {};
  const hasInfra = Object.keys(ra).some((k) =>
    INFRA_KEY_PATTERNS.some((p) => k.startsWith(p) || k === p)
  );
  const hasLinks = (attrs?.links?.length ?? 0) > 0;
  const hasEvents = !!selectedSpanId && events.some((e) => e.spanId === selectedSpanId);
  return {
    hasLogs: spanScopedLogsCount > 0,
    hasEvents,
    hasLinks,
    hasInfra,
  };
}

/** Pick the smartest default tab when a new span is selected. */
export function getDefaultDetailTab(
  attrs: SpanAttributes | null,
  availability: TabAvailability
): SpanDetailTab {
  const hasException =
    !!attrs?.exceptionType || !!attrs?.exceptionMessage || !!attrs?.exceptionStacktrace;
  if (hasException) return "info";
  if (availability.hasLogs) return "logs";
  return "info";
}
