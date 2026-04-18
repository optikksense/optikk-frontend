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

import { SERVICE_TOPOLOGY_STYLES } from "./topologyStyles";

interface ServiceTopologyGraphProps {
  readonly nodes: Node[];
  readonly edges: Edge[];
  readonly nodeTypes: NodeTypes;
  readonly edgeTypes: EdgeTypes;
  readonly showMiniMap?: boolean;
  readonly showControls?: boolean;
  readonly onNodeDoubleClick?: (name: string) => void;
  readonly fitViewPadding?: number;
}

function GraphInner({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  showMiniMap = true,
  showControls = true,
  onNodeDoubleClick,
  fitViewPadding = 0.15,
}: ServiceTopologyGraphProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: fitViewPadding }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      onNodeDoubleClick={(_, node) => onNodeDoubleClick?.(node.id)}
    >
      <Background color="var(--border-color)" gap={24} />
      {showControls ? <Controls showInteractive={false} position="bottom-left" /> : null}
      {showMiniMap ? (
        <MiniMap
          zoomable
          pannable
          nodeColor={() => "var(--text-muted)"}
          maskColor="rgba(0,0,0,0.45)"
        />
      ) : null}
    </ReactFlow>
  );
}

export function ServiceTopologyGraph(props: ServiceTopologyGraphProps) {
  return (
    <ReactFlowProvider>
      <style>{SERVICE_TOPOLOGY_STYLES}</style>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
