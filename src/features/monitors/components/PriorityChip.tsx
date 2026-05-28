import { memo } from "react";

import type { MonitorPriority } from "../api/monitorsApi";

interface Props {
  readonly priority: MonitorPriority | string;
}

const COLORS: Record<string, string> = {
  P1: "text-red-500",
  P2: "text-amber-500",
  P3: "text-zinc-400",
  P4: "text-zinc-500",
};

function PriorityChip({ priority }: Props) {
  return (
    <span className={`font-mono text-[11px] font-bold ${COLORS[priority] ?? "text-zinc-400"}`}>
      {priority}
    </span>
  );
}

export default memo(PriorityChip);
