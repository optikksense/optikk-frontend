import type { TraceRecord } from "@shared/api/traces/schemas";

export interface CriticalPathSummary {
  readonly spanCount: number;
  readonly durationMs: number;
  readonly pctOfTrace: number;
  readonly topSpanName: string | null;
}

export function summarizeCriticalPath(
  spans: readonly TraceRecord[],
  criticalPathSpanIds: ReadonlySet<string>,
  traceDurationMs?: number
): CriticalPathSummary {
  if (!spans.length || !criticalPathSpanIds.size) {
    return { spanCount: 0, durationMs: 0, pctOfTrace: 0, topSpanName: null };
  }

  const critSpans = spans.filter((s) => criticalPathSpanIds.has(s.spanId));
  const durationMs = critSpans.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
  const total = traceDurationMs && traceDurationMs > 0 ? traceDurationMs : 1;
  const pctOfTrace = Math.min(100, Math.round((durationMs / total) * 100));

  critSpans.sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));
  const topSpan = critSpans[0];
  const topSpanName = topSpan ? `${topSpan.serviceName} · ${topSpan.operationName}` : null;

  return {
    spanCount: critSpans.length,
    durationMs,
    pctOfTrace,
    topSpanName,
  };
}

export function computeMaxDepth(spans: readonly TraceRecord[]): number {
  if (!spans.length) return 0;
  const byId = new Map(spans.map((s) => [s.spanId, s]));
  let max = 0;
  for (const s of spans) {
    let d = 0;
    let cur = s.parentSpanId ? byId.get(s.parentSpanId) : undefined;
    while (cur) {
      d += 1;
      cur = cur.parentSpanId ? byId.get(cur.parentSpanId) : undefined;
    }
    if (d > max) max = d;
  }
  return max;
}
