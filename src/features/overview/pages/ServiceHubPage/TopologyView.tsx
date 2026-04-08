import {
  Background,
  Controls,
  type Edge,
  type EdgeTypes,
  MiniMap,
  type Node,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { buildServiceDrawerSearch } from "../../components/serviceDrawerState";
import { ServiceTopologyEdge, type TopologyEdgeData } from "./topology/ServiceTopologyEdge";
import { ServiceTopologyNode, type TopologyNodeData } from "./topology/ServiceTopologyNode";
import { TopologyToolbar } from "./topology/TopologyToolbar";
import { type ServiceTopologyResponse, fetchServiceTopology } from "./topology/api";
import { layoutTopology } from "./topology/layout";

const nodeTypes: NodeTypes = { service: ServiceTopologyNode };
const edgeTypes: EdgeTypes = { service: ServiceTopologyEdge };

interface BuildArgs {
  data: ServiceTopologyResponse;
  filter: string;
  onOpen: (name: string) => void;
}

function buildGraph({ data, filter, onOpen }: BuildArgs): { nodes: Node[]; edges: Edge[] } {
  const f = filter.trim().toLowerCase();
  const matches = (name: string) => (f ? name.toLowerCase().includes(f) : true);

  const maxCallCount = data.edges.reduce((acc, e) => Math.max(acc, e.call_count), 1);

  const rawNodes: Node[] = data.nodes.map((n) => {
    const nodeData: TopologyNodeData = {
      ...n,
      dimmed: !matches(n.name),
      onOpen,
    };
    return {
      id: n.name,
      type: "service",
      position: { x: 0, y: 0 },
      data: nodeData as unknown as Record<string, unknown>,
      draggable: true,
    };
  });

  const edges: Edge[] = data.edges.map((e) => {
    const edgeData: TopologyEdgeData = {
      callCount: e.call_count,
      errorCount: e.error_count,
      errorRate: e.error_rate,
      p50LatencyMs: e.p50_latency_ms,
      p95LatencyMs: e.p95_latency_ms,
      source: e.source,
      target: e.target,
      dimmed: !(matches(e.source) || matches(e.target)),
      maxCallCount,
    };
    return {
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      type: "service",
      animated: e.call_count > 0,
      data: edgeData as unknown as Record<string, unknown>,
    };
  });

  return { nodes: layoutTopology(rawNodes, edges), edges };
}

const topologyStyles = `
  .react-flow__controls {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    margin: 16px !important;
  }

  .react-flow__controls-button {
    background: var(--bg-card);
    color: var(--text-secondary);
    border: none !important;
    border-bottom: 1px solid var(--border-color) !important;
    width: 28px !important;
    height: 28px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-colors);
  }

  .react-flow__controls-button:last-child {
    border-bottom: none !important;
  }

  .react-flow__controls-button:hover {
    background: var(--bg-hover) !important;
    color: var(--text-primary) !important;
  }

  .react-flow__controls-button svg {
    fill: currentColor;
    width: 14px;
    height: 14px;
  }

  .react-flow__minimap {
    background-color: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    box-shadow: var(--shadow-lg) !important;
    margin: 16px !important;
  }

  .react-flow__minimap-mask {
    fill: rgba(0, 0, 0, 0.45) !important;
  }
`;

function TopologyCanvas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusService = searchParams.get("topologyFocus") ?? "";
  const filter = searchParams.get("serviceSearch") ?? "";

  const query = useTimeRangeQuery(
    "services-topology",
    async (_teamId, startTime, endTime) => {
      return fetchServiceTopology({
        startTime,
        endTime,
        service: focusService || undefined,
      });
    },
    { extraKeys: [focusService] }
  );

  const openService = (name: string): void => {
    const search = buildServiceDrawerSearch(location.search, name);
    navigate({ to: location.pathname + search, replace: true });
  };

  const setFocus = (name: string): void => {
    const next = new URLSearchParams(searchParams);
    if (name) next.set("topologyFocus", name);
    else next.delete("topologyFocus");
    setSearchParams(next);
  };

  const setFilter = (value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("serviceSearch", value);
    else next.delete("serviceSearch");
    setSearchParams(next, { replace: true });
  };

  const data = query.data ?? { nodes: [], edges: [] };
  const { nodes, edges } = useMemo(
    () => buildGraph({ data, filter, onOpen: openService }),
    // openService closes over searchParams but re-creating per render is cheap
    [data, filter]
  );

  const isEmpty = !query.isLoading && nodes.length === 0;

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)]">
      <style>{topologyStyles}</style>
      <TopologyToolbar
        filter={filter}
        onFilterChange={setFilter}
        nodeCount={data.nodes.length}
        edgeCount={data.edges.length}
        focusService={focusService}
        onClearFocus={() => setFocus("")}
      />
      <div className="relative flex-1">
        {query.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
            Loading topology…
          </div>
        ) : null}
        {query.isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--color-error)]">
            Failed to load service topology.
          </div>
        ) : null}
        {isEmpty && !query.isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
            No service activity in this time range.
          </div>
        ) : null}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          onNodeDoubleClick={(_, node) => setFocus(node.id)}
        >
          <Background color="var(--border-color)" gap={24} />
          <Controls showInteractive={false} position="bottom-left" />
          <MiniMap
            zoomable
            pannable
            nodeColor={() => "var(--text-muted)"}
            maskColor="rgba(0,0,0,0.45)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function TopologyView() {
  // ReactFlowProvider is required for hooks like useReactFlow() if we add them
  // later, and keeps state isolated to this view.
  return (
    <ReactFlowProvider>
      <TopologyCanvas />
    </ReactFlowProvider>
  );
}
