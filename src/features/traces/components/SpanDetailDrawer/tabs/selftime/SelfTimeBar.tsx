import { formatDuration } from "@shared/utils/formatters";
import { memo } from "react";

import type { SpanSelfTime } from "../../../../types";

interface Props {
  entry: SpanSelfTime;
  maxTotal: number;
}

function SelfTimeBarComponent({ entry, maxTotal }: Props) {
  const selfPct = entry.totalDurationMs > 0 ? (entry.selfTimeMs / entry.totalDurationMs) * 100 : 0;
  const childPct = 100 - selfPct;
  const barWidth = entry.totalDurationMs / maxTotal;
  return (
    <div>
      <div className="sdd-selftime__label">
        <span className="truncate font-mono">{entry.operationName}</span>
        <span>{formatDuration(entry.selfTimeMs)} self</span>
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
}

export const SelfTimeBar = memo(SelfTimeBarComponent);
