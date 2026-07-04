import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import {
  ServiceTopologyGraph,
  type ServiceTopologyResponse,
  buildTopologyGraph,
  topologyEdgeTypes,
  topologyNodeTypes,
} from "@shared/components/ui/charts/ServiceTopologyGraph";

import { ROUTES } from "@/shared/constants/routes";

interface Props {
  readonly map: ServiceTopologyResponse | null;
}

/**
 * Renders the per-trace service map (services with span/error counts + edges
 * from this trace's parent→child links) on the shared topology-graph kit.
 * p95/p99 are layered in upstream from RED metrics; p50 is this trace's average.
 */
export function ServiceMapView({ map }: Props) {
  const navigate = useNavigate();
  const openService = useCallback(
    (name: string): void => {
      const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(name));
      navigate({ to: detail as string & {} });
    },
    [navigate]
  );

  const { nodes, edges } = useMemo(
    () => buildTopologyGraph({ data: map ?? { nodes: [], edges: [] }, onOpen: openService }),
    [map, openService]
  );

  if (nodes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-foreground-muted">
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
