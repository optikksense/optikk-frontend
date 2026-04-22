import { useCallback, useMemo } from "react";

import { traceDetailPath } from "../constants/routes";
import type { TraceSummary } from "../types/trace";

export interface TraceRowHelpers {
  readonly detailHref: string;
  readonly durationMs: number;
  readonly copyTraceId: () => Promise<void>;
}

/**
 * Per-row helpers: memoized detail link, duration conversion (ns → ms),
 * and a copy-to-clipboard action. Component code stays declarative.
 */
export function useTraceRow(trace: TraceSummary): TraceRowHelpers {
  const detailHref = useMemo(() => traceDetailPath(trace.trace_id), [trace.trace_id]);
  const durationMs = trace.duration_ns / 1_000_000;
  const copyTraceId = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(trace.trace_id);
    } catch {
      /* ignore — permissions or unfocused document */
    }
  }, [trace.trace_id]);
  return { detailHref, durationMs, copyTraceId };
}
