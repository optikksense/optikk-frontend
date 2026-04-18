import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import {
  buildTopologyGraph,
  topologyEdgeTypes,
  topologyNodeTypes,
} from "@/features/overview/pages/ServiceHubPage/topology/buildGraph";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { ServiceTopologyGraph } from "@shared/components/ui/charts/ServiceTopologyGraph";

import type { ServiceTopologyResponse } from "@/features/overview/pages/ServiceHubPage/topology/api";

interface ServiceTopologyMapProps {
  readonly topology: ServiceTopologyResponse;
  readonly loading: boolean;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-[12px] text-[var(--text-muted)]">
      {label}
    </div>
  );
}

export default function ServiceTopologyMap({ topology, loading }: ServiceTopologyMapProps) {
  const navigate = useNavigate();

  const openService = (name: string): void => {
    const path = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(name));
    navigate(dynamicNavigateOptions(path));
  };

  const graph = useMemo(
    () => buildTopologyGraph({ data: topology, onOpen: openService }),
    // openService captures navigate; re-creating per render is cheap.
    [topology]
  );

  if (loading && graph.nodes.length === 0) {
    return <EmptyState label="Loading dependency map…" />;
  }
  if (graph.nodes.length === 0) {
    return <EmptyState label="No upstream or downstream services observed." />;
  }

  return (
    <div className="h-[320px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)]">
      <ServiceTopologyGraph
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={topologyNodeTypes}
        edgeTypes={topologyEdgeTypes}
        showMiniMap={false}
        onNodeDoubleClick={openService}
        fitViewPadding={0.25}
      />
    </div>
  );
}
