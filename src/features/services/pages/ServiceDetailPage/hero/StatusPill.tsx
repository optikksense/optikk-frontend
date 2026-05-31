import { cn } from "@/lib/utils";

import type { HeroStatus } from "../hooks/useServiceHeroData";

const TONES: Record<HeroStatus, { bg: string; text: string; dot: string; label: string }> = {
  healthy: {
    bg: "bg-success-subtle",
    text: "text-success",
    dot: "bg-success",
    label: "Healthy",
  },
  warn: {
    bg: "bg-warning-subtle",
    text: "text-warning",
    dot: "bg-warning",
    label: "Warn",
  },
  error: {
    bg: "bg-error-subtle",
    text: "text-error",
    dot: "bg-error",
    label: "Error",
  },
  unknown: {
    bg: "bg-muted",
    text: "text-foreground-muted",
    dot: "bg-foreground-muted",
    label: "Unknown",
  },
};

export function StatusPill({ status }: { status: HeroStatus }) {
  const tone = TONES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-[11px] uppercase tracking-wide",
        tone.bg,
        tone.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {tone.label}
    </span>
  );
}
