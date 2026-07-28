interface SpanLike {
  startTime?: string | number | null;
  endTime?: string | number | null;
}

export interface TraceTimeBounds {
  startMs?: number;
  endMs?: number;
}

   
                                                                        
                                                                       
   
export function computeTraceTimeBounds(spans: readonly SpanLike[]): TraceTimeBounds {
  if (spans.length === 0) return { startMs: undefined, endMs: undefined };

  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;

  for (const span of spans) {
    const start = span.startTime ? new Date(span.startTime).getTime() : Number.NaN;
    const end = span.endTime ? new Date(span.endTime).getTime() : Number.NaN;
    if (Number.isFinite(start) && start < minStart) minStart = start;
    if (Number.isFinite(end) && end > maxEnd) maxEnd = end;
  }

  return {
    startMs: Number.isFinite(minStart) ? minStart : undefined,
    endMs: Number.isFinite(maxEnd) ? maxEnd : undefined,
  };
}
