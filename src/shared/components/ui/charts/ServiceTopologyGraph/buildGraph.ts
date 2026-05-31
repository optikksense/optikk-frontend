import type { Edge, Node } from "@xyflow/react";

import { ServiceTopologyEdge, type TopologyEdgeData } from "./ServiceTopologyEdge";
import { ServiceTopologyNode, type TopologyNodeData } from "./ServiceTopologyNode";
import type { ServiceTopologyResponse } from "./api";
import { layoutTopology } from "./layout";

export const topologyNodeTypes = { service: ServiceTopologyNode } as const;
export const topologyEdgeTypes = { service: ServiceTopologyEdge } as const;

export interface BuildGraphArgs {
  readonly data: ServiceTopologyResponse;
  readonly filter?: string;
  readonly onOpen?: (name: string) => void;
}

export interface BuiltGraph {
  readonly nodes: Node[];
  readonly edges: Edge[];
}

function matcher(filter: string): (name: string) => boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return () => true;
  return (name) => name.toLowerCase().includes(needle);
}

const NOOP_OPEN: (name: string) => void = () => undefined;

function toNode(
  row: ServiceTopologyResponse["nodes"][number],
  matches: (name: string) => boolean,
  onOpen: (name: string) => void
): Node {
  const data: TopologyNodeData = { ...row, dimmed: !matches(row.name), onOpen };
  return {
    id: row.name,
    type: "service",
    position: { x: 0, y: 0 },
    data: data as unknown as Record<string, unknown>,
    draggable: true,
  };
}

function toEdge(
  row: ServiceTopologyResponse["edges"][number],
  matches: (name: string) => boolean,
  maxCallCount: number
): Edge {
  const data: TopologyEdgeData = {
    callCount: row.call_count,
    errorCount: row.error_count,
    errorRate: row.error_rate,
    p50LatencyMs: row.p50_latency_ms,
    p95LatencyMs: row.p95_latency_ms,
    source: row.source,
    target: row.target,
    dimmed: !(matches(row.source) || matches(row.target)),
    maxCallCount,
  };
  return {
    id: `${row.source}->${row.target}`,
    source: row.source,
    target: row.target,
    type: "service",
    animated: row.call_count > 0,
    data: data as unknown as Record<string, unknown>,
  };
}

export function buildTopologyGraph({ data, filter = "", onOpen }: BuildGraphArgs): BuiltGraph {
  const matches = matcher(filter);
  const handleOpen = onOpen ?? NOOP_OPEN;
  const maxCallCount = data.edges.reduce((acc, edge) => Math.max(acc, edge.call_count), 1);
  const rawNodes = data.nodes.map((row) => toNode(row, matches, handleOpen));
  const edges = data.edges.map((row) => toEdge(row, matches, maxCallCount));
  return { nodes: layoutTopology(rawNodes, edges), edges };
}
