import { cn } from "@/lib/utils";

import { deltaDirection, formatDelta } from "../utils/formatStat";

interface DeltaBadgeProps {
  readonly delta: number | null;
  /** Pre-formatted label override (e.g. "+22ms"); falls back to formatted delta. */
  readonly label?: string;
  readonly className?: string;
}

const DIRECTION_CLASS: Record<"up" | "down" | "flat", string> = {
  up: "text-[var(--color-success)]",
  down: "text-[var(--color-error)]",
  flat: "text-[var(--text-muted)]",
};

/** Colored signed-change indicator. Increase = red (down), decrease = green (up). */
export function DeltaBadge({ delta, label, className }: DeltaBadgeProps) {
  const direction = deltaDirection(delta);
  return (
    <span className={cn("font-medium text-[11px]", DIRECTION_CLASS[direction], className)}>
      {label ?? formatDelta(delta)}
    </span>
  );
}
