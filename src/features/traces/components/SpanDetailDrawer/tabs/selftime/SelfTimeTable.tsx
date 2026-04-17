import { formatDuration } from "@shared/utils/formatters";
import { memo } from "react";

import type { SpanSelfTime } from "../../../../types";

function SelfTimeRow({ entry }: { entry: SpanSelfTime }) {
  const pct =
    entry.totalDurationMs > 0
      ? `${((entry.selfTimeMs / entry.totalDurationMs) * 100).toFixed(1)}%`
      : "—";
  return (
    <div className="sdd-attr-table__row">
      <span className="truncate font-mono text-xs" style={{ flex: 2 }}>
        {entry.operationName}
      </span>
      <span style={{ width: 70 }}>{formatDuration(entry.totalDurationMs)}</span>
      <span style={{ width: 70 }}>{formatDuration(entry.selfTimeMs)}</span>
      <span style={{ width: 70 }}>{formatDuration(entry.childTimeMs)}</span>
      <span style={{ width: 60 }}>{pct}</span>
    </div>
  );
}

function SelfTimeTableComponent({ rows }: { rows: SpanSelfTime[] }) {
  return (
    <div className="sdd-attr-table mt-sm">
      <div className="sdd-attr-table__header">
        <span style={{ flex: 2 }}>Operation</span>
        <span style={{ width: 70 }}>Total</span>
        <span style={{ width: 70 }}>Self</span>
        <span style={{ width: 70 }}>Children</span>
        <span style={{ width: 60 }}>Self %</span>
      </div>
      <div className="sdd-attr-table__body">
        {rows.map((entry) => (
          <SelfTimeRow key={entry.spanId} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export const SelfTimeTable = memo(SelfTimeTableComponent);
