import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Surface } from '@/components/ui';

import type { ServiceDependencyDetail } from '../../types';
import { healthStatusColor, deriveHealthStatus } from '../../types';

interface DependencyNode {
  name: string;
  callCount: number;
  p95LatencyMs: number;
  errorRate: number;
  direction: 'upstream' | 'downstream' | 'center';
}

interface ServiceDependencyMapProps {
  serviceName: string;
  upstream: ServiceDependencyDetail[];
  downstream: ServiceDependencyDetail[];
  loading: boolean;
}

function NodeCard({
  node,
  isCenter,
  onClick,
  onHover,
  hovered,
}: {
  node: DependencyNode;
  isCenter: boolean;
  onClick: () => void;
  onHover: (name: string | null) => void;
  hovered: boolean;
}) {
  const health = deriveHealthStatus(node.errorRate);
  const borderColor = isCenter ? 'var(--color-primary)' : healthStatusColor(health);
  const opacity = hovered ? 1 : 0.85;

  return (
    <div
      className="relative cursor-pointer rounded-lg border-2 bg-[var(--bg-card)] px-4 py-3 transition-all hover:shadow-lg"
      style={{ borderColor, opacity, minWidth: 180 }}
      onClick={onClick}
      onMouseEnter={() => onHover(node.name)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: healthStatusColor(health) }}
        />
        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {node.name}
        </span>
      </div>
      {!isCenter && (
        <div className="mt-1.5 flex gap-4 text-[10px] text-[var(--text-muted)]">
          <span>{node.callCount.toLocaleString()} calls</span>
          <span>{node.p95LatencyMs.toFixed(1)}ms p95</span>
          <span
            className={
              node.errorRate > 5
                ? 'text-red-400'
                : node.errorRate > 1
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }
          >
            {node.errorRate.toFixed(1)}% err
          </span>
        </div>
      )}
      {isCenter && (
        <div className="mt-1 text-[10px] font-medium text-[var(--color-primary)]">
          Current Service
        </div>
      )}
    </div>
  );
}

function EdgeArrow({ direction }: { direction: 'right' | 'left' }) {
  return (
    <div className="flex items-center px-2">
      <svg width="60" height="24" viewBox="0 0 60 24">
        <defs>
          <marker
            id={`arrow-${direction}`}
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)" />
          </marker>
        </defs>
        {direction === 'right' ? (
          <line
            x1="4"
            y1="12"
            x2="52"
            y2="12"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd={`url(#arrow-${direction})`}
          />
        ) : (
          <line
            x1="56"
            y1="12"
            x2="8"
            y2="12"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd={`url(#arrow-${direction})`}
          />
        )}
      </svg>
    </div>
  );
}

export default function ServiceDependencyMap({
  serviceName,
  upstream,
  downstream,
  loading,
}: ServiceDependencyMapProps) {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const upstreamNodes: DependencyNode[] = useMemo(
    () =>
      upstream.map((d) => ({
        name: d.source === serviceName ? d.target : d.source,
        callCount: d.callCount,
        p95LatencyMs: d.p95LatencyMs,
        errorRate: d.errorRate,
        direction: 'upstream' as const,
      })),
    [upstream, serviceName]
  );

  const downstreamNodes: DependencyNode[] = useMemo(
    () =>
      downstream.map((d) => ({
        name: d.source === serviceName ? d.target : d.source,
        callCount: d.callCount,
        p95LatencyMs: d.p95LatencyMs,
        errorRate: d.errorRate,
        direction: 'downstream' as const,
      })),
    [downstream, serviceName]
  );

  const centerNode: DependencyNode = {
    name: serviceName,
    callCount: 0,
    p95LatencyMs: 0,
    errorRate: 0,
    direction: 'center',
  };

  if (loading) {
    return (
      <Surface elevation={1} padding="md" className="animate-pulse">
        <div className="h-[300px]" />
      </Surface>
    );
  }

  if (upstreamNodes.length === 0 && downstreamNodes.length === 0) {
    return (
      <Surface elevation={1} padding="md">
        <div className="flex h-[200px] items-center justify-center text-sm text-[var(--text-muted)]">
          No dependencies found for this service
        </div>
      </Surface>
    );
  }

  return (
    <Surface elevation={1} padding="md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Service Dependencies</h3>
        <button
          className="text-xs text-[var(--color-primary)] hover:underline"
          onClick={() => navigate('/services?tab=service-map')}
        >
          View Full Topology →
        </button>
      </div>

      <div className="flex items-start justify-center gap-0 overflow-x-auto py-4">
        {/* Upstream column */}
        <div className="flex flex-col items-end gap-3" style={{ minWidth: 200 }}>
          {upstreamNodes.length > 0 && (
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Upstream ({upstreamNodes.length})
            </div>
          )}
          {upstreamNodes.map((node) => (
            <div key={node.name} className="flex items-center">
              <NodeCard
                node={node}
                isCenter={false}
                onClick={() => navigate(`/services/${encodeURIComponent(node.name)}`)}
                onHover={setHoveredNode}
                hovered={hoveredNode === null || hoveredNode === node.name}
              />
              <EdgeArrow direction="right" />
            </div>
          ))}
        </div>

        {/* Center node */}
        <div className="flex flex-col items-center justify-center" style={{ minHeight: 120 }}>
          <NodeCard
            node={centerNode}
            isCenter
            onClick={() => {}}
            onHover={() => {}}
            hovered
          />
        </div>

        {/* Downstream column */}
        <div className="flex flex-col items-start gap-3" style={{ minWidth: 200 }}>
          {downstreamNodes.length > 0 && (
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Downstream ({downstreamNodes.length})
            </div>
          )}
          {downstreamNodes.map((node) => (
            <div key={node.name} className="flex items-center">
              <EdgeArrow direction="right" />
              <NodeCard
                node={node}
                isCenter={false}
                onClick={() => navigate(`/services/${encodeURIComponent(node.name)}`)}
                onHover={setHoveredNode}
                hovered={hoveredNode === null || hoveredNode === node.name}
              />
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}
