import { memo } from 'react';

import { NODE_W, NODE_H } from './utils/topologyLayoutAlgorithms';

import type { ServiceGraphEdge } from '@shared/components/ui/charts/specialized/ServiceGraph';

interface TopologyEdgeProps {
  edge: ServiceGraphEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  maxCalls: number;
  dimmed: boolean;
  animate: boolean;
  onHover: (edge: { source: string; target: string } | null) => void;
}

function edgeColor(errorRate: number): string {
  if (errorRate > 5) return '#ff4d5a';
  if (errorRate > 1) return '#f7b63a';
  return '#5a6275';
}

function buildBezier(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const cp = Math.max(Math.abs(dx) * 0.4, 60);
  return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
}

export default memo(function TopologyEdge({
  edge,
  sourcePos,
  targetPos,
  maxCalls,
  dimmed,
  animate,
  onHover,
}: TopologyEdgeProps) {
  const x1 = sourcePos.x + NODE_W;
  const y1 = sourcePos.y + NODE_H / 2;
  const x2 = targetPos.x;
  const y2 = targetPos.y + NODE_H / 2;

  const color = edgeColor(edge.errorRate);
  const width = 1.2 + (edge.callCount / Math.max(maxCalls, 1)) * 3;
  const opacity = dimmed ? 0.1 : 0.8;
  const path = buildBezier(x1, y1, x2, y2);
  const isCritical = edge.errorRate > 5;

  return (
    <g opacity={opacity}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={isCritical ? undefined : '6 3'}
        markerEnd={`url(#topo-arrow${isCritical ? '-critical' : ''})`}
        onMouseEnter={() => onHover({ source: edge.source, target: edge.target })}
        onMouseLeave={() => onHover(null)}
        style={{ cursor: 'pointer' }}
      />

      {/* Animated particle */}
      {animate && (
        <circle r={3} fill={color} opacity={0.8}>
          <animateMotion dur={`${Math.max(1.5 - (edge.callCount / Math.max(maxCalls, 1)), 0.4)}s`} repeatCount="indefinite">
            <mpath href="" />
          </animateMotion>
          <animateMotion path={path} dur={`${Math.max(2 - (edge.callCount / Math.max(maxCalls, 1)), 0.5)}s`} repeatCount="indefinite" />
        </circle>
      )}

      {/* Call count label at midpoint */}
      {!dimmed && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fill="#7e8595"
          fontSize={9}
          fontFamily="Inter, sans-serif"
        >
          {edge.callCount.toLocaleString()}
        </text>
      )}
    </g>
  );
});
