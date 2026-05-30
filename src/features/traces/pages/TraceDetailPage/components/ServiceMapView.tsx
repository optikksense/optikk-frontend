import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import {
  type ServiceTopologyResponse,
  ServiceTopologyGraph,
  buildTopologyGraph,
  topologyEdgeTypes,
  topologyNodeTypes,
} from "@shared/components/ui/charts/ServiceTopologyGraph";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import type { ServiceMapResponse } from "@shared/api/schemas/tracesSchemas";

interface Props {
  readonly map: ServiceMapResponse | null;
}

/**
 * Adapts the per-trace service map (services with span/error counts + total
 * time, and service→service call edges) onto the shared topology-graph kit.
 * Per-trace data carries no percentiles, so latency is the real average
 * (total_ms / count) and p95/p99 are left at 0 rather than invented.
 */
function toTopology(map: ServiceMapResponse | null): ServiceTopologyResponse {
  if (!map) return { nodes: [], edges: [] };
  const nodes: ServiceTopologyResponse["nodes"] = map.nodes.map((n) => {
    const errorRate = n.span_count > 0 ? n.error_count / n.span_count : 0;
    return {
      name: n.service,
      request_count: n.span_count,
      error_count: n.error_count,
      error_rate: errorRate,
      p50_latency_ms: n.span_count > 0 ? n.total_ms / n.span_count : 0,
      p95_latency_ms: 0,
      p99_latency_ms: 0,
      health: errorRate >= 0.05 ? "unhealthy" : errorRate > 0 ? "degraded" : "healthy",
    };
  });
  const edges: ServiceTopologyResponse["edges"] = map.edges.map((e) => ({
    source: e.from,
    target: e.to,
    call_count: e.call_count,
    error_count: e.error_count,
    error_rate: e.call_count > 0 ? e.error_count / e.call_count : 0,
    p50_latency_ms: e.call_count > 0 ? e.total_ms / e.call_count : 0,
    p95_latency_ms: 0,
  }));
  return { nodes, edges };
}

export function ServiceMapView({ map }: Props) {
  const navigate = useNavigate();
  const openService = useCallback(
    (name: string): void => {
      const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(name));
      navigate(dynamicNavigateOptions(detail));
    },
    [navigate]
  );

  const { nodes, edges } = useMemo(() => {
    const topo = toTopology(map);
    return buildTopologyGraph({ data: topo, onOpen: openService });
  }, [map, openService]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--text-muted)]">
        No service map available for this trace.
      </div>
    );
  }

  return (
    <div className="relative min-h-[460px] flex-1">
      <ServiceTopologyGraph
        nodes={nodes}
        edges={edges}
        nodeTypes={topologyNodeTypes}
        edgeTypes={topologyEdgeTypes}
        onNodeDoubleClick={openService}
      />
    </div>
  );
}
