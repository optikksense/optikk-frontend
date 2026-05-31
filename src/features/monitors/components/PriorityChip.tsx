import { memo } from "react";

import type { MonitorPriority } from "../api/monitorsApi";

interface Props {
  readonly priority: MonitorPriority | string;
}

const COLORS: Record<string, string> = {
  P1: "text-error",
  P2: "text-warning",
  P3: "text-foreground-secondary",
  P4: "text-foreground-muted",
};

function PriorityChip({ priority }: Props) {
  return (
    <span
      className={`font-bold font-mono text-[11px] ${COLORS[priority] ?? "text-foreground-muted"}`}
    >
      {priority}
    </span>
  );
}

export default memo(PriorityChip);
