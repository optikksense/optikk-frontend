import { memo } from 'react';

import { NODE_W, NODE_H } from './utils/topologyLayoutAlgorithms';

interface TopologyMiniMapProps {
  positions: Record<string, { x: number; y: number }>;
  canvasWidth: number;
  canvasHeight: number;
  viewportScale: number;
  viewportTranslate: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  matchingNames: Set<string>;
  statusMap: Record<string, string>;
}

const MINIMAP_W = 160;
const MINIMAP_H = 110;

const STATUS_COLORS: Record<string, string> = {
  healthy: '#35d68f',
  degraded: '#f7b63a',
  unhealthy: '#ff4d5a',
  critical: '#ff4d5a',
};

export default memo(function TopologyMiniMap({
  positions,
  canvasWidth,
  canvasHeight,
  viewportScale,
  viewportTranslate,
  containerWidth,
  containerHeight,
  matchingNames,
  statusMap,
}: TopologyMiniMapProps) {
  if (canvasWidth === 0 || canvasHeight === 0) return null;

  const scaleX = MINIMAP_W / canvasWidth;
  const scaleY = MINIMAP_H / canvasHeight;
  const s = Math.min(scaleX, scaleY);

  // Viewport rectangle
  const vpW = (containerWidth / viewportScale) * s;
  const vpH = (containerHeight / viewportScale) * s;
  const vpX = -viewportTranslate.x * s;
  const vpY = -viewportTranslate.y * s;

  return (
    <div
      className="absolute bottom-3 left-3 z-10 rounded-lg border border-[rgba(95,106,133,0.45)] bg-[rgba(15,18,25,0.9)] p-1.5"
      style={{ width: MINIMAP_W + 12, height: MINIMAP_H + 12 }}
    >
      <svg width={MINIMAP_W} height={MINIMAP_H} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
        {/* Nodes as dots */}
        {Object.entries(positions).map(([name, pos]) => {
          const color = STATUS_COLORS[statusMap[name]?.toLowerCase()] ?? '#5a6275';
          const matched = matchingNames.has(name);
          return (
            <rect
              key={name}
              x={pos.x}
              y={pos.y}
              width={NODE_W}
              height={NODE_H}
              rx={4}
              fill={color}
              opacity={matched ? 0.7 : 0.15}
            />
          );
        })}

        {/* Viewport rectangle */}
        <rect
          x={vpX}
          y={vpY}
          width={Math.min(vpW, canvasWidth)}
          height={Math.min(vpH, canvasHeight)}
          fill="none"
          stroke="rgba(124,127,242,0.7)"
          strokeWidth={Math.max(canvasWidth / MINIMAP_W * 1.5, 3)}
          rx={4}
        />
      </svg>
    </div>
  );
});
