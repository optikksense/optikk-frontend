import { useMemo } from "react";

import type { ServiceTopologyResponse } from "@shared/api/topology";
import { useImmutableQuery } from "@shared/hooks/useImmutableQuery";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { tracesService } from "@shared/api/traces/tracesApi";

// Pad the (often sub-minute) trace window out to whole minutes so the RED
// 1-minute rollup returns the bucket(s) covering the trace.
const MINUTE_MS = 60_000;

export function useTraceServiceMap(
  tenantId: number | null,
  traceId: string,
  bounds: { startMs?: number; endMs?: number },
  latencyEnabled: boolean
) {
  const startMs = bounds.startMs ?? 0;
  const endMs = bounds.endMs ?? 0;
  const hasBounds = startMs > 0 && endMs >= startMs;

  const mapQuery = useImmutableQuery({
    queryKey: ["trace-service-map", tenantId, traceId, startMs, endMs],
    queryFn: ({ signal }) => tracesService.getServiceMap(traceId, startMs, endMs, signal),
    enabled: !!tenantId && !!traceId && hasBounds,
  });

  // The latency baselines are a RED rollup lookup, so they keep a real range —
  // taken from the trace's own span bounds.
  const fromMs = Math.floor(startMs / MINUTE_MS) * MINUTE_MS;
  const toMs = Math.ceil(endMs / MINUTE_MS) * MINUTE_MS;
  const latencyQuery = useStandardQuery({
    queryKey: ["trace-service-latency", tenantId, fromMs, toMs],
    queryFn: ({ signal }) => tracesService.getServiceLatencyBaselines(fromMs, toMs, signal),
    enabled: !!tenantId && latencyEnabled && startMs > 0 && endMs >= startMs,
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
        return b ? { ...n, p95LatencyMs: b.p95, p99LatencyMs: b.p99 } : n;
      }),
      edges: base.edges,
    };
  }, [mapQuery.data, latencyQuery.data]);

  return { data, isLoading: mapQuery.isLoading, isError: mapQuery.isError };
}
