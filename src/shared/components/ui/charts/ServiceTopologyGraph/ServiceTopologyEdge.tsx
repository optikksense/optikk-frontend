import { formatPercentage } from "@shared/utils/formatters";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { formatMs, formatNumber } from "./format";

import { Tooltip } from "@shared/components/primitives/ui";

export interface TopologyEdgeData {
  callCount: number;
  errorCount: number;
  errorRate: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  dimmed: boolean;
  source: string;
  target: string;
  maxCallCount: number;
}

function edgeColor(d: TopologyEdgeData): string {
  if (d.errorRate > 0.05) return "var(--color-error)";
  if (d.p95LatencyMs > 500) return "var(--color-warning)";
  return "var(--border-color)";
}

function edgeWidth(d: TopologyEdgeData): number {
  if (d.maxCallCount <= 1) return 1.5;
  const ratio = Math.log10(d.callCount + 1) / Math.log10(d.maxCallCount + 1);
  return Math.max(1, Math.min(6, 1 + ratio * 5));
}

export function ServiceTopologyEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd } =
    props;
  const d = (props.data ?? {}) as unknown as TopologyEdgeData;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const stroke = edgeColor(d);
  const width = edgeWidth(d);
  const opacity = d.dimmed ? 0.15 : 1;

  const tooltip = (
    <div className="flex flex-col gap-1 text-[12px]">
      <div className="font-semibold text-foreground">
        {d.source} → {d.target}
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-foreground-muted">Calls</span>
        <span>{formatNumber(d.callCount)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-foreground-muted">Errors</span>
        <span>
          {formatNumber(d.errorCount)} (
          {formatPercentage(d.errorRate * 100, d.errorRate >= 0.001 ? 1 : 2)})
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-foreground-muted">p50</span>
        <span>{formatMs(d.p50LatencyMs)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-foreground-muted">p95</span>
        <span>{formatMs(d.p95LatencyMs)}</span>
      </div>
    </div>
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke, strokeWidth: width, opacity, transition: "opacity 150ms" }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            opacity,
          }}
          className="nodrag nopan"
        >
          <Tooltip content={tooltip} placement="top">
            <div className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-foreground-muted shadow-[var(--shadow-sm)]">
              {formatNumber(d.callCount)}
              {d.errorRate > 0 ? (
                <span className="ml-1 text-error">
                  {formatPercentage(d.errorRate * 100, d.errorRate >= 0.001 ? 1 : 2)}
                </span>
              ) : null}
            </div>
          </Tooltip>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
