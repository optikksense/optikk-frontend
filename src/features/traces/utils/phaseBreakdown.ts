import type { FlamegraphFrame } from "@shared/api/schemas/tracesSchemas";

/**
 * The four execution phases a span's self-time can be attributed to. Self-time
 * (wall time spent in the span itself, excluding descendants) is the honest
 * "where did the time go" signal, so the breakdown sums self-time per phase
 * rather than wall-clock duration, which would double-count nested work.
 */
export const TRACE_PHASES = ["db", "network", "compute", "other"] as const;

export type TracePhase = (typeof TRACE_PHASES)[number];

/** A single phase's share of the trace's total self-time. */
export interface PhaseSegment {
  readonly phase: TracePhase;
  readonly selfTimeMs: number;
  readonly spanCount: number;
  /** Self-time as a share of total trace self-time (0–100). */
  readonly pct: number;
}

/**
 * Span-kind values are emitted uppercased on the wire (e.g. `"CLIENT"`,
 * `"SERVER"`; see tracesApi span_kind). We normalize before matching so a
 * differently-cased backend still classifies correctly.
 */
const CLIENT_KINDS: ReadonlySet<string> = new Set(["CLIENT", "PRODUCER", "CONSUMER"]);
const COMPUTE_KINDS: ReadonlySet<string> = new Set(["INTERNAL", "SERVER"]);

/**
 * Classify a single frame into a phase:
 * - **db**: a `db_system` is present (an outbound database call).
 * - **network/wait**: Client/Producer/Consumer span with no `db_system` —
 *   time spent waiting on a downstream peer.
 * - **compute**: Internal/Server span — local work and request handling.
 * - **other**: anything that matches none of the above (e.g. unset kind).
 *
 * `db_system` lives on the per-span attributes endpoint, not on flamegraph
 * frames, so callers that have resolved it pass a `dbSpanIds` set; without it
 * a Client span falls through to network/wait, which is the correct default.
 */
function classifyFrame(frame: FlamegraphFrame, dbSpanIds: ReadonlySet<string>): TracePhase {
  if (dbSpanIds.has(frame.span_id)) return "db";
  const kind = frame.span_kind.toUpperCase();
  if (CLIENT_KINDS.has(kind)) return "network";
  if (COMPUTE_KINDS.has(kind)) return "compute";
  return "other";
}

/**
 * Sum self-time per phase across the flamegraph frames and return one segment
 * per non-empty phase, ordered by the canonical `TRACE_PHASES` sequence. The
 * percentage base is the summed self-time, which equals the trace wall time.
 *
 * Mirrors `computeHotSpans`: both rank on the backend-computed `self_time_ms`
 * carried by frames rather than recomputing intervals from the spans list.
 */
export function computePhaseBreakdown(
  frames: readonly FlamegraphFrame[],
  dbSpanIds: ReadonlySet<string> = new Set()
): readonly PhaseSegment[] {
  if (frames.length === 0) return [];

  const selfTimeByPhase = new Map<TracePhase, number>();
  const countByPhase = new Map<TracePhase, number>();
  let totalSelfMs = 0;

  for (const frame of frames) {
    const selfMs = Math.max(0, frame.self_time_ms);
    if (selfMs <= 0) continue;
    const phase = classifyFrame(frame, dbSpanIds);
    selfTimeByPhase.set(phase, (selfTimeByPhase.get(phase) ?? 0) + selfMs);
    countByPhase.set(phase, (countByPhase.get(phase) ?? 0) + 1);
    totalSelfMs += selfMs;
  }

  if (totalSelfMs <= 0) return [];

  return TRACE_PHASES.filter((phase) => (selfTimeByPhase.get(phase) ?? 0) > 0).map((phase) => {
    const selfTimeMs = selfTimeByPhase.get(phase) ?? 0;
    return {
      phase,
      selfTimeMs,
      spanCount: countByPhase.get(phase) ?? 0,
      pct: (selfTimeMs / totalSelfMs) * 100,
    };
  });
}
