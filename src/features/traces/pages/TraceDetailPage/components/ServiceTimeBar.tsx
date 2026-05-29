import { memo, useMemo } from "react";

import { Tooltip } from "@shared/components/primitives/ui";
import { formatDuration } from "@shared/utils/formatters";

import type { ServiceMapNode } from "@shared/api/schemas/tracesSchemas";

import { getServiceColor } from "../../../utils/serviceColor";

interface Props {
  readonly nodes: readonly ServiceMapNode[];
}

interface Segment {
  readonly service: string;
  readonly totalMs: number;
  readonly spanCount: number;
  readonly errorCount: number;
  readonly pct: number;
  readonly color: string;
}

const labelK = "text-[10.5px] tracking-[0.06em] uppercase text-[var(--text-caption)]";

/**
 * Stacked horizontal bar showing each service's share of the trace's total
 * span time, sourced from the per-trace service map (`total_ms` per node).
 * This is aggregate busy-time across all spans of a service — it can exceed
 * the trace wall time when services run in parallel, so the bar is normalized
 * to the summed total rather than to the trace duration.
 */
function ServiceTimeBarComponent({ nodes }: Props) {
  const segments = useMemo<Segment[]>(() => {
    const total = nodes.reduce((acc, n) => acc + Math.max(0, n.total_ms), 0);
    if (total <= 0) return [];
    return [...nodes]
      .filter((n) => n.total_ms > 0)
      .sort((a, b) => b.total_ms - a.total_ms)
      .map((n) => ({
        service: n.service,
        totalMs: n.total_ms,
        spanCount: n.span_count,
        errorCount: n.error_count,
        pct: (n.total_ms / total) * 100,
        color: getServiceColor(n.service),
      }));
  }, [nodes]);

  if (segments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      <div className={labelK}>Service time</div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-[3px] gap-px bg-[var(--bg-tertiary)]">
        {segments.map((s) => (
          <Tooltip
            key={s.service}
            content={`${s.service} · ${formatDuration(s.totalMs)} · ${s.pct.toFixed(1)}% · ${s.spanCount} span${s.spanCount === 1 ? "" : "s"}${s.errorCount > 0 ? ` · ${s.errorCount} error${s.errorCount === 1 ? "" : "s"}` : ""}`}
          >
            <div
              style={{ width: `${s.pct}%`, background: s.color, minWidth: 3 }}
              className="h-full cursor-default"
            />
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1">
        {segments.map((s) => (
          <span
            key={s.service}
            className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] whitespace-nowrap"
          >
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: s.color }}
            />
            {s.service}
            <span className="font-mono text-[var(--text-caption)]">{s.pct.toFixed(0)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export const ServiceTimeBar = memo(ServiceTimeBarComponent);
