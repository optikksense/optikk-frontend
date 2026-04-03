import { useMemo } from 'react';

import {
  computeLayout,
  type LayoutMode,
  type LayoutResult,
  type LayoutEdge,
} from '../utils/topologyLayoutAlgorithms';

export function useTopologyLayout(
  nodeNames: string[],
  edges: LayoutEdge[],
  mode: LayoutMode,
  centerNode?: string
): LayoutResult {
  return useMemo(
    () => computeLayout(mode, nodeNames, edges, centerNode),
    [mode, nodeNames, edges, centerNode]
  );
}
