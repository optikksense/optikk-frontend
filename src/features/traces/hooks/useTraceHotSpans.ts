import { tracesService } from "@shared/api/tracesService";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useMemo } from "react";

import { type HotSpan, computeHotSpans } from "../utils/hotSpans";

/**
 * Top-N spans by self-time, derived from the flamegraph frames (which carry a
 * backend-computed `self_time_ms`). Fetched eagerly and independently of the
 * lazy flamegraph-viz query so the summary strip can show hot spans regardless
 * of which visualization tab is active. The query key matches
 * `useTraceFlamegraph`'s underlying call so the two dedupe in cache.
 */
export function useTraceHotSpans(traceId: string, topN = 3): readonly HotSpan[] {
  const { data } = useStandardQuery({
    queryKey: ["trace-flamegraph-frames", traceId],
    queryFn: () => tracesService.getFlamegraphData(traceId),
    enabled: !!traceId,
  });

  return useMemo(() => computeHotSpans(data ?? [], topN), [data, topN]);
}
