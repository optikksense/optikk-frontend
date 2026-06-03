import { useMemo } from "react";

import type { ServiceTopologyResponse } from "@shared/components/ui/charts/ServiceTopologyGraph";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useQuery } from "@tanstack/react-query";

import { tracesService } from "../api/tracesApi";

// Pad the (often sub-minute) trace window out to whole minutes so the RED
// 1-minute rollup returns the bucket(s) covering the trace.
const MINUTE_MS = 60_000;

/**
 * Per-trace service map in the shared topology shape (nodes = services with
 * span/error counts, edges = service-to-service calls). The trace itself has no
 * latency distribution, so p95/p99 are layered in from the RED summary over the
 * trace's time window, keyed by service name.
 */
export function useTraceServiceMap(
  traceId: string,
  startMs: number,
  endMs: number,
  latencyEnabled: boolean
) {
  const mapQuery = useStandardQuery({
    queryKey: ["trace-service-map", traceId],
    queryFn: () => tracesService.getServiceMap(traceId),
    enabled: !!traceId,
  });

  const fromMs = Math.floor(startMs / MINUTE_MS) * MINUTE_MS;
  const toMs = Math.ceil(endMs / MINUTE_MS) * MINUTE_MS;
  const latencyQuery = useQuery({
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
