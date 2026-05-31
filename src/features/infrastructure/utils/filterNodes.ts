import type { InfrastructureNode } from "../types";
import { type NodeHealthTier, tierForNode } from "./nodeHealth";

export interface NodeFilterState {
  readonly search: string;
  /** Empty set means "all tiers". */
  readonly tiers: ReadonlySet<NodeHealthTier>;
  /** Empty string means "all services". */
  readonly service: string;
}

export const EMPTY_NODE_FILTER: NodeFilterState = {
  search: "",
  tiers: new Set(),
  service: "",
};

/** Sorted union of every service name across the given nodes. */
export function serviceOptions(nodes: readonly InfrastructureNode[]): readonly string[] {
  const seen = new Set<string>();
  for (const node of nodes) {
    for (const svc of node.services) seen.add(svc);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

function matchesSearch(node: InfrastructureNode, needle: string): boolean {
  if (node.host.toLowerCase().includes(needle)) return true;
  return node.services.some((svc) => svc.toLowerCase().includes(needle));
}

export function filterNodes(
  nodes: readonly InfrastructureNode[],
  filter: NodeFilterState
): readonly InfrastructureNode[] {
  const needle = filter.search.trim().toLowerCase();
  return nodes.filter((node) => {
    if (needle && !matchesSearch(node, needle)) return false;
    if (filter.tiers.size > 0 && !filter.tiers.has(tierForNode(node))) return false;
    if (filter.service && !node.services.includes(filter.service)) return false;
    return true;
  });
}
