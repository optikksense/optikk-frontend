import type { ServiceTopologyResponse } from "@shared/components/ui/charts/ServiceTopologyGraph";

function buildAdjacency(edges: ServiceTopologyResponse["edges"]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    const out = adjacency.get(edge.source) ?? new Set<string>();
    out.add(edge.target);
    adjacency.set(edge.source, out);
    const incoming = adjacency.get(edge.target) ?? new Set<string>();
    incoming.add(edge.source);
    adjacency.set(edge.target, incoming);
  }
  return adjacency;
}

/**
 * Reduce a full topology to the focus service plus everything within `hops`
 * (undirected: callers and dependencies). Layout is left→right callers · focus ·
 * dependencies once handed to `buildTopologyGraph`.
 */
export function focusSubgraph(
  data: ServiceTopologyResponse,
  focus: string,
  hops: number
): ServiceTopologyResponse {
  if (!focus || !data.nodes.some((n) => n.name === focus)) return data;

  const adjacency = buildAdjacency(data.edges);
  const keep = new Set<string>([focus]);
  let frontier = [focus];
  for (let depth = 0; depth < hops; depth += 1) {
    const next: string[] = [];
    for (const node of frontier) {
      for (const neighbour of adjacency.get(node) ?? []) {
        if (!keep.has(neighbour)) {
          keep.add(neighbour);
          next.push(neighbour);
        }
      }
    }
    frontier = next;
  }

  return {
    nodes: data.nodes.filter((n) => keep.has(n.name)),
    edges: data.edges.filter((e) => keep.has(e.source) && keep.has(e.target)),
  };
}

export function highestTrafficService(data: ServiceTopologyResponse): string {
  let best = "";
  let bestCount = -1;
  for (const node of data.nodes) {
    if (node.request_count > bestCount) {
      bestCount = node.request_count;
      best = node.name;
    }
  }
  return best;
}
