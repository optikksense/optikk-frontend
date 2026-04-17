import { formatDuration } from "@shared/utils/formatters";
import { memo, useMemo } from "react";

import type { SpanSelfTime } from "../../../types";

const TOP_N = 20;

function SelfTimeTabComponent({ selfTimes }: { selfTimes: SpanSelfTime[] }) {
  const top = useMemo(
    () => [...selfTimes].sort((a, b) => b.selfTimeMs - a.selfTimeMs).slice(0, TOP_N),
    [selfTimes]
  );

  const maxTotal = useMemo(() => {
    let max = 1;
    for (const s of top) if (s.totalDurationMs > max) max = s.totalDurationMs;
    return max;
  }, [top]);

  if (selfTimes.length === 0) {
    return <div className="sdd-center sdd-empty">No self-time data available</div>;
  }

  return (
    <div>
      <div className="mb-md flex-col gap-xs">
        {top.map((s) => {
          const selfPct = s.totalDurationMs > 0 ? (s.selfTimeMs / s.totalDurationMs) * 100 : 0;
          const childPct = 100 - selfPct;
          const barWidth = s.totalDurationMs / maxTotal;
          return (
            <div key={s.spanId}>
              <div className="sdd-selftime__label">
                <span className="truncate font-mono">{s.operationName}</span>
                <span>{formatDuration(s.selfTimeMs)} self</span>
              </div>
              <div className="sdd-selftime__bar" style={{ width: `${barWidth * 100}%` }}>
                <div
                  className="sdd-selftime__self"
                  style={{ flex: selfPct, minWidth: selfPct > 0 ? 2 : 0 }}
                />
                <div
                  className="sdd-selftime__child"
                  style={{ flex: childPct, minWidth: childPct > 0 ? 2 : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="sdd-selftime__legend">
        <span>
          <span className="sdd-selftime__dot sdd-selftime__dot--self" />
          Self time
        </span>
        <span>
          <span className="sdd-selftime__dot sdd-selftime__dot--child" />
          Child time
        </span>
      </div>
      <div className="sdd-attr-table mt-sm">
        <div className="sdd-attr-table__header">
          <span style={{ flex: 2 }}>Operation</span>
          <span style={{ width: 70 }}>Total</span>
          <span style={{ width: 70 }}>Self</span>
          <span style={{ width: 70 }}>Children</span>
          <span style={{ width: 60 }}>Self %</span>
        </div>
        <div className="sdd-attr-table__body">
          {top.map((s) => (
            <div key={s.spanId} className="sdd-attr-table__row">
              <span className="truncate font-mono text-xs" style={{ flex: 2 }}>
                {s.operationName}
              </span>
              <span style={{ width: 70 }}>{formatDuration(s.totalDurationMs)}</span>
              <span style={{ width: 70 }}>{formatDuration(s.selfTimeMs)}</span>
              <span style={{ width: 70 }}>{formatDuration(s.childTimeMs)}</span>
              <span style={{ width: 60 }}>
                {s.totalDurationMs > 0
                  ? `${((s.selfTimeMs / s.totalDurationMs) * 100).toFixed(1)}%`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const SelfTimeTab = memo(SelfTimeTabComponent);
