import { memo } from "react";

import type { MonitorPriority } from "../api/monitorsApi";

interface Props {
  readonly priority: MonitorPriority | string;
}

const COLORS: Record<string, string> = {
  P1: "text-[var(--color-error)]",
  P2: "text-[var(--color-warning)]",
  P3: "text-[var(--text-secondary)]",
  P4: "text-[var(--text-muted)]",
};

function PriorityChip({ priority }: Props) {
  return (
    <span
      className={`font-mono text-[11px] font-bold ${COLORS[priority] ?? "text-[var(--text-muted)]"}`}
    >
      {priority}
    </span>
  );
}

export default memo(PriorityChip);
