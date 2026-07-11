import { memo } from "react";

import { cn } from "@shared/lib/utils";

import type { Tone } from "../view-models/saturationScore";

type Props = {
  tone: Tone;
  text: string;
  size?: "md" | "sm";
};

const TONE_CLASSES: Record<Tone, string> = {
  ok: "bg-success-subtle text-success border-[color-mix(in_oklch,var(--color-success),transparent_65%)]",
  warn: "bg-warning-subtle text-warning border-[color-mix(in_oklch,var(--color-warning),transparent_65%)]",
  err: "bg-error-subtle text-error border-[color-mix(in_oklch,var(--color-error),transparent_65%)]",
  neutral: "bg-muted text-foreground-secondary border-border",
};

function StatusChipImpl({ tone, text, size = "md" }: Props): JSX.Element {
  const isSmall = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] rounded-full border font-medium",
        isSmall ? "h-[22px] px-2 text-[11px]" : "h-8 px-[14px] text-[12.5px]",
        TONE_CLASSES[tone]
      )}
    >
      <span className="h-[7px] w-[7px] rounded-full bg-current shadow-[0_0_0_3px_color-mix(in_oklch,currentColor,transparent_82%)]" />
      {text}
    </span>
  );
}

export const StatusChip = memo(StatusChipImpl);
