import { useMemo } from "react";

import type { ServiceTopologyResponse } from "@shared/api/topology";
import { useImmutableQuery } from "@shared/hooks/useImmutableQuery";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { tracesService } from "@shared/api/traces/tracesApi";

// Pad the (often sub-minute) trace window out to whole minutes so the RED
// 1-minute rollup returns the bucket(s) covering the trace.
const MINUTE_MS = 60_000;

export function useTraceServiceMap(
  traceId: string,
  bounds: { startMs?: number; endMs?: number },
  latencyEnabled: boolean
) {
  const mapQuery = useImmutableQuery({
    queryKey: ["trace-service-map", traceId],
    queryFn: () => tracesService.getServiceMap(traceId),
    enabled: !!traceId,
  });

  // The latency baselines are a RED rollup lookup, so they keep a real range —
  // taken from the trace's own span bounds.
  const startMs = bounds.startMs ?? 0;
  const endMs = bounds.endMs ?? 0;
  const fromMs = Math.floor(startMs / MINUTE_MS) * MINUTE_MS;
  const toMs = Math.ceil(endMs / MINUTE_MS) * MINUTE_MS;
  const latencyQuery = useStandardQuery({
    queryKey: ["trace-service-latency", fromMs, toMs],
    queryFn: () => tracesService.getServiceLatencyBaselines(fromMs, toMs),
    enabled: latencyEnabled && startMs > 0 && endMs >= startMs,
    staleTime: 60_000,
  });

  const data = useMemo<ServiceTopologyResponse | undefined>(() => {
    const base = mapQuery.data;
    if (!base) return undefined;
    const latency = latencyQuery.data;
    if (!latency || latency.size === 0) return base;
    return {
      nodes: base.nodes.map((n) => {
        const b = latency.get(n.name);
        return b ? { ...n, p95_latency_ms: b.p95, p99_latency_ms: b.p99 } : n;
      }),
      edges: base.edges,
    };
  }, [mapQuery.data, latencyQuery.data]);

  return { data, isLoading: mapQuery.isLoading, isError: mapQuery.isError };
}
