import { Handle, Position, type NodeProps } from '@xyflow/react';

import { Tooltip } from '@shared/components/primitives/ui';

import type { ServiceTopologyNode } from './api';
import { NODE_HEIGHT, NODE_WIDTH } from './layout';

export type TopologyNodeData = ServiceTopologyNode & {
  dimmed: boolean;
  onOpen: (name: string) => void;
};

const healthRingColor: Record<ServiceTopologyNode['health'], string> = {
  healthy: 'var(--color-success)',
  degraded: 'var(--color-warning)',
  unhealthy: 'var(--color-error)',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

function formatMs(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(2)}s`;
  return `${n.toFixed(1)}ms`;
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(n >= 0.1 ? 1 : 2)}%`;
}

export function ServiceTopologyNode({ data }: NodeProps) {
  const d = data as TopologyNodeData;
  const ringColor = healthRingColor[d.health];

  const tooltip = (
    <div className="flex flex-col gap-1 text-[12px]">
      <div className="font-semibold text-[var(--text-primary)]">{d.name}</div>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--text-muted)]">Requests</span>
        <span>{formatNumber(d.request_count)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--text-muted)]">Errors</span>
        <span>
          {formatNumber(d.error_count)} ({formatPct(d.error_rate)})
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--text-muted)]">p50</span>
        <span>{formatMs(d.p50_latency_ms)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--text-muted)]">p95</span>
        <span>{formatMs(d.p95_latency_ms)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-[var(--text-muted)]">p99</span>
        <span>{formatMs(d.p99_latency_ms)}</span>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltip} placement="top">
      <div
        onClick={() => d.onOpen(d.name)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') d.onOpen(d.name);
        }}
        role="button"
        tabIndex={0}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT, opacity: d.dimmed ? 0.25 : 1 }}
        className="group flex cursor-pointer flex-col justify-between rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
      >
        <Handle type="target" position={Position.Left} className="!bg-[var(--border-color)]" />
        <Handle type="source" position={Position.Right} className="!bg-[var(--border-color)]" />

        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: ringColor, boxShadow: `0 0 0 3px ${ringColor}22` }}
            aria-hidden
          />
          <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
            {d.name}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 text-[11px] leading-tight">
          <div className="flex flex-col">
            <span className="text-[var(--text-muted)]">req</span>
            <span className="text-[var(--text-primary)]">{formatNumber(d.request_count)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[var(--text-muted)]">err</span>
            <span
              style={{
                color: d.error_rate > 0.05 ? 'var(--color-error)' : 'var(--text-primary)',
              }}
            >
              {formatPct(d.error_rate)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[var(--text-muted)]">p95</span>
            <span className="text-[var(--text-primary)]">{formatMs(d.p95_latency_ms)}</span>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
