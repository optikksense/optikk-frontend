import { memo } from 'react';

import { APP_COLORS } from '@config/colorLiterals';
import { inferServiceType } from './utils/topologyClusterDetection';
import { NODE_W, NODE_H } from './utils/topologyLayoutAlgorithms';

import type { ServiceGraphNode } from '@shared/components/ui/charts/specialized/ServiceGraph';

const STATUS_COLORS: Record<string, string> = {
  healthy: APP_COLORS.hex_35d68f ?? '#35d68f',
  degraded: APP_COLORS.hex_f7b63a ?? '#f7b63a',
  unhealthy: APP_COLORS.hex_ff4d5a ?? '#ff4d5a',
  critical: APP_COLORS.hex_ff4d5a ?? '#ff4d5a',
};

const TYPE_ICONS: Record<string, string> = {
  database: '🗄',
  cache: '⚡',
  queue: '📨',
  grpc: '🔗',
  external: '🌐',
  application: '📦',
};

interface TopologyNodeProps {
  node: ServiceGraphNode;
  x: number;
  y: number;
  dimmed: boolean;
  selected: boolean;
  highlighted: boolean;
  onHover: (name: string | null) => void;
  onClick: (name: string) => void;
}

export default memo(function TopologyNode({
  node,
  x,
  y,
  dimmed,
  selected,
  highlighted,
  onHover,
  onClick,
}: TopologyNodeProps) {
  const statusColor = STATUS_COLORS[node.status?.toLowerCase()] ?? STATUS_COLORS.healthy;
  const type = inferServiceType(node.name);
  const icon = TYPE_ICONS[type] ?? TYPE_ICONS.application;
  const opacity = dimmed ? 0.2 : 1;
  const borderColor = selected
    ? 'rgba(124,127,242,0.9)'
    : highlighted
      ? 'rgba(124,127,242,0.5)'
      : 'rgba(65,88,145,0.45)';
  const borderWidth = selected ? 2.5 : 1;

  const truncName = node.name.length > 24 ? node.name.slice(0, 23) + '…' : node.name;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      opacity={opacity}
      onMouseEnter={() => onHover(node.name)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.name);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Card background */}
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={10}
        fill="rgba(20,23,31,0.92)"
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {/* Left accent bar */}
      <rect x={0} y={12} width={3.5} height={NODE_H - 24} rx={2} fill={statusColor} />

      {/* Type icon */}
      <text x={14} y={24} fontSize={13}>
        {icon}
      </text>

      {/* Service name */}
      <text x={32} y={26} fill="#e8ecf8" fontSize={12.5} fontWeight={600} fontFamily="Inter, sans-serif">
        {truncName}
      </text>

      {/* Status dot */}
      <circle cx={16} cy={46} r={3.5} fill={statusColor} />

      {/* Inline metrics */}
      <text x={26} y={49} fill="#9ea8bf" fontSize={10} fontFamily="Inter, sans-serif">
        {node.requestCount.toLocaleString()} req
      </text>
      <text x={NODE_W / 2 + 10} y={49} fill="#9ea8bf" fontSize={10} fontFamily="Inter, sans-serif">
        {node.errorRate.toFixed(1)}% err
      </text>

      {/* Latency */}
      <text x={16} y={68} fill="#7e8595" fontSize={10} fontFamily="Inter, sans-serif">
        {node.avgLatency.toFixed(0)}ms avg
      </text>
      <text x={NODE_W - 16} y={68} textAnchor="end" fill="#7e8595" fontSize={10} fontFamily="Inter, sans-serif">
        {type}
      </text>

      {/* Critical glow */}
      {(node.status === 'unhealthy' || node.status === 'critical') && (
        <rect
          width={NODE_W}
          height={NODE_H}
          rx={10}
          fill="none"
          stroke={APP_COLORS.hex_ff4d5a ?? '#ff4d5a'}
          strokeWidth={1}
          opacity={0.4}
        >
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
});
