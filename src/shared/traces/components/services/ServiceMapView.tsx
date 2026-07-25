import { useCallback, useMemo } from "react";

import type { ServiceTopologyResponse } from "@shared/api/topology";
import {
  ServiceTopologyGraph,
  buildTopologyGraph,
  topologyEdgeTypes,
  topologyNodeTypes,
} from "@shared/components/ui/charts/ServiceTopologyGraph";

interface Props {
  readonly map: ServiceTopologyResponse | null;
  readonly onOpenService?: (serviceName: string) => void;
}

export function ServiceMapView({ map, onOpenService }: Props) {
  const openService = useCallback(
    (name: string): void => {
      onOpenService?.(name);
    },
    [onOpenService]
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
