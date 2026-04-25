import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { tracesService } from "@shared/api/tracesService";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";

/**
 * Fires GET /traces/:traceId/bundle on mount and seeds the individual query
 * caches for spans, logs, critical-path, error-path, span-kind-breakdown so
 * downstream hooks (`useTraceDetailData`, `useTraceDetailEnhanced`) get their
 * data from the bundle response without making five additional round-trips.
 *
 * Falls back transparently: if the bundle call fails, the individual queries
 * still execute on their own. This is request consolidation, not a cache.
 */
export function useTraceBundle(selectedTeamId: number | null, traceIdParam: string) {
  const qc = useQueryClient();
  const q = useStandardQuery({
    queryKey: ["trace-bundle", selectedTeamId, traceIdParam],
    queryFn: () => tracesService.getTraceBundle(traceIdParam),
    enabled: !!selectedTeamId && !!traceIdParam,
  });
  useEffect(() => {
    const data = q.data;
    if (!data) return;
    // Seed the individual React Query caches so the downstream always-on hooks
    // find their data already present and skip the network.
    qc.setQueryData(["trace-spans", selectedTeamId, traceIdParam], data.spans);
    qc.setQueryData(["trace-logs", selectedTeamId, traceIdParam], { logs: data.logs, is_speculative: false });
    qc.setQueryData(["trace-critical-path", traceIdParam], data.critical_path);
    qc.setQueryData(["trace-error-path", traceIdParam], data.error_path);
    qc.setQueryData(["trace-span-kind-breakdown", traceIdParam], data.span_kind_breakdown);
  }, [q.data, qc, selectedTeamId, traceIdParam]);
  return q;
}
