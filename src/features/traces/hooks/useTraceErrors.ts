import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { tracesService } from "../api/tracesApi";

/**
 * Per-trace error groups, grouped by exception type with the offending spans.
 * Backs the trace error-summary panel. Immutable per trace.
 */
export function useTraceErrors(traceId: string, enabled = true) {
  return useStandardQuery({
    queryKey: ["trace-errors", traceId],
    queryFn: () => tracesService.getTraceErrors(traceId),
    enabled: !!traceId && enabled,
  });
}
