import { memo } from "react";

import { cn } from "@/lib/utils";

import type { Tone } from "../view-models/saturationScore";

type Props = {
  tone: Tone;
  text: string;
  size?: "md" | "sm";
};

const TONE_CLASSES: Record<Tone, string> = {
  ok: "bg-[oklch(0.78_0.16_152_/_0.1)] text-[var(--info-c)] border-[oklch(0.78_0.16_152_/_0.35)]",
  warn: "bg-[oklch(0.84_0.16_92_/_0.12)] text-[var(--warn-c)] border-[oklch(0.84_0.16_92_/_0.35)]",
  err: "bg-[oklch(0.7_0.2_25_/_0.1)] text-[var(--err-c)] border-[oklch(0.7_0.2_25_/_0.35)]",
  neutral:
    "bg-[oklch(0.55_0.01_270_/_0.1)] text-[var(--fg-3)] border-[oklch(0.55_0.01_270_/_0.25)]",
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
      <span className="h-[7px] w-[7px] rounded-full bg-current shadow-[0_0_0_3px_oklch(0_0_0_/_0.12)]" />
      {text}
    </span>
  );
}

export const StatusChip = memo(StatusChipImpl);
