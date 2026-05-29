import type { FlamegraphFrame } from "@shared/api/schemas/tracesSchemas";

/**
 * A span ranked by its self-time (wall time spent in the span itself, excluding
 * descendants). Self-time isolates where work actually happens, independent of
 * how deep the call tree is — the canonical "what's slow" signal for a trace.
 */
export interface HotSpan {
  readonly spanId: string;
  readonly operation: string;
  readonly service: string;
  readonly selfTimeMs: number;
  readonly durationMs: number;
  readonly hasError: boolean;
  /** Self-time as a share of total trace self-time (0–100). */
  readonly pctOfTrace: number;
}

/**
 * Rank spans by self-time and return the top N.
 *
 * Flamegraph frames already carry a backend-computed `self_time_ms` per span
 * (duration minus the merged child intervals), so we rank on that directly
 * rather than recomputing intervals from the spans list. The percentage base
 * is the sum of all self-times, which equals the trace's wall time.
 */
export function computeHotSpans(frames: readonly FlamegraphFrame[], topN = 3): readonly HotSpan[] {
  if (frames.length === 0) return [];

  const totalSelfMs = frames.reduce((acc, f) => acc + Math.max(0, f.self_time_ms), 0);

  return [...frames]
    .filter((f) => f.self_time_ms > 0)
    .sort((a, b) => b.self_time_ms - a.self_time_ms)
    .slice(0, topN)
    .map((f) => ({
      spanId: f.span_id,
      operation: f.operation || f.name,
      service: f.service,
      selfTimeMs: f.self_time_ms,
      durationMs: f.duration_ms,
      hasError: f.has_error,
      pctOfTrace: totalSelfMs > 0 ? (f.self_time_ms / totalSelfMs) * 100 : 0,
    }));
}
