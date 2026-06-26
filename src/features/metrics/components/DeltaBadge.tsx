import { cn } from "@/lib/utils";

import { deltaDirection, formatDelta } from "../utils/formatStat";

interface DeltaBadgeProps {
  readonly delta: number | null;
  /** Pre-formatted label override (e.g. "+22ms"); falls back to formatted delta. */
  readonly label?: string;
  readonly className?: string;
}

const DIRECTION_CLASS: Record<"up" | "down" | "flat", string> = {
  up: "text-success",
  down: "text-error",
  flat: "text-foreground-muted",
};

export function DeltaBadge({ delta, label, className }: DeltaBadgeProps) {
  const direction = deltaDirection(delta);
  return (
    <span className={cn("font-medium text-[11px]", DIRECTION_CLASS[direction], className)}>
      {label ?? formatDelta(delta)}
    </span>
  );
}
