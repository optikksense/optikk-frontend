import { memo } from "react";

import { Tooltip } from "@shared/components/primitives/ui";
import { formatDuration } from "@shared/utils/formatters";

import type { PhaseSegment, TracePhase } from "../../../utils/phaseBreakdown";

interface Props {
  readonly segments: readonly PhaseSegment[];
}

const PHASE_META: Record<TracePhase, { readonly label: string; readonly color: string }> = {
  db: { label: "Database", color: "var(--chart-5)" },
  network: { label: "Network / wait", color: "var(--chart-2)" },
  compute: { label: "Compute", color: "var(--chart-1)" },
  other: { label: "Other", color: "var(--color-unknown)" },
};

const labelK = "text-[10.5px] tracking-[0.06em] uppercase text-[var(--text-caption)]";

/**
 * Stacked horizontal bar showing how the trace's total self-time splits across
 * execution phases (database, network/wait, compute, other). Self-time is the
 * honest "where did the time go" measure, so the bar is normalized to the
 * summed self-time across all spans (= trace wall time) rather than to any
 * single span's duration. Sibling of `ServiceTimeBar` in the summary strip.
 */
function PhaseBreakdownBarComponent({ segments }: Props) {
  if (segments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      <div className={labelK}>Phase breakdown</div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-[3px] gap-px bg-[var(--bg-tertiary)]">
        {segments.map((s) => (
          <Tooltip
            key={s.phase}
            content={`${PHASE_META[s.phase].label} · ${formatDuration(s.selfTimeMs)} · ${s.pct.toFixed(1)}% · ${s.spanCount} span${s.spanCount === 1 ? "" : "s"}`}
          >
            <div
              style={{ width: `${s.pct}%`, background: PHASE_META[s.phase].color, minWidth: 3 }}
              className="h-full cursor-default"
            />
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1">
        {segments.map((s) => (
          <span
            key={s.phase}
            className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] whitespace-nowrap"
          >
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: PHASE_META[s.phase].color }}
            />
            {PHASE_META[s.phase].label}
            <span className="font-mono text-[var(--text-caption)]">{s.pct.toFixed(0)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export const PhaseBreakdownBar = memo(PhaseBreakdownBarComponent);
