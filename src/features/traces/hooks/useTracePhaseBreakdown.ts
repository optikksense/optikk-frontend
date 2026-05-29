import { tracesService } from "@shared/api/tracesService";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useMemo } from "react";

import { type PhaseSegment, computePhaseBreakdown } from "../utils/phaseBreakdown";

/**
 * Self-time grouped into execution phases (db / network / compute / other),
 * derived from the same flamegraph frames as `useTraceHotSpans`. Reuses the
 * `["trace-flamegraph-frames", traceId]` query key so the two dedupe in cache
 * and the breakdown is available regardless of which visualization tab is open.
 */
export function useTracePhaseBreakdown(traceId: string): readonly PhaseSegment[] {
  const { data } = useStandardQuery({
    queryKey: ["trace-flamegraph-frames", traceId],
    queryFn: () => tracesService.getFlamegraphData(traceId),
    enabled: !!traceId,
  });

  return useMemo(() => computePhaseBreakdown(data ?? []), [data]);
}
