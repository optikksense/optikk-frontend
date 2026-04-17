import { memo, useMemo } from "react";

import type { SpanSelfTime } from "../../../types";

import { SelfTimeBar } from "./selftime/SelfTimeBar";
import { SelfTimeTable } from "./selftime/SelfTimeTable";

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
        {top.map((entry) => (
          <SelfTimeBar key={entry.spanId} entry={entry} maxTotal={maxTotal} />
        ))}
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
      <SelfTimeTable rows={top} />
    </div>
  );
}

export const SelfTimeTab = memo(SelfTimeTabComponent);
