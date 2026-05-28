import { cn } from "@/lib/utils";

import type { HeroStatus } from "../hooks/useServiceHeroData";

const TONES: Record<HeroStatus, { bg: string; text: string; dot: string; label: string }> = {
  healthy: {
    bg: "bg-[var(--color-success-subtle)]",
    text: "text-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
    label: "Healthy",
  },
  warn: {
    bg: "bg-[var(--color-warning-subtle)]",
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
    label: "Warn",
  },
  error: {
    bg: "bg-[var(--color-error-subtle)]",
    text: "text-[var(--color-error)]",
    dot: "bg-[var(--color-error)]",
    label: "Error",
  },
  unknown: {
    bg: "bg-[var(--bg-tertiary)]",
    text: "text-[var(--text-muted)]",
    dot: "bg-[var(--text-muted)]",
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
