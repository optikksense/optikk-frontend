import { tracesService } from "@shared/api/traces/tracesApi";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";

/**
 * Per-trace error groups, grouped by exception type with the offending spans.
 * Backs the trace error-summary panel. Immutable per trace.
 */
export function useTraceErrors(
  traceId: string,
  bounds: { startMs?: number; endMs?: number },
  enabled = true
) {
  const startMs = bounds.startMs ?? 0;
  const endMs = bounds.endMs ?? 0;
  const hasBounds = startMs > 0 && endMs >= startMs;

  return useStandardQuery({
    queryKey: ["trace-errors", traceId, startMs, endMs],
    queryFn: () => tracesService.getTraceErrors(traceId, startMs, endMs),
    enabled: !!traceId && enabled && hasBounds,
  });
}
