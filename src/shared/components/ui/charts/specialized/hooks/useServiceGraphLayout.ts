import { useMemo } from 'react';
import type { ServiceGraphEdge, ServiceGraphNode } from '../ServiceGraph';
import { buildLayout } from '../utils/graphUtils';

export function useServiceGraphLayout(
  nodes: readonly ServiceGraphNode[],
  edges: readonly ServiceGraphEdge[]
) {
  const layout = useMemo(() => buildLayout(nodes, edges), [nodes, edges]);

  const maxCalls = useMemo(
    () => Math.max(...layout.edges.map((edge) => Number(edge.callCount || 0)), 1),
    [layout.edges]
  );

  return {
    ...layout,
    maxCalls,
  };
}
