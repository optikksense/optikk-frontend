import { cn } from "@/lib/utils";

import type { HeroStatus } from "../hooks/useServiceHeroData";

const TONES: Record<HeroStatus, { bg: string; text: string; dot: string; label: string }> = {
  healthy: {
    bg: "bg-[var(--color-success-bg,rgba(16,185,129,0.12))]",
    text: "text-[var(--color-success,#10b981)]",
    dot: "bg-[var(--color-success,#10b981)]",
    label: "Healthy",
  },
  warn: {
    bg: "bg-[var(--color-warning-bg,rgba(245,158,11,0.12))]",
    text: "text-[var(--color-warning,#f59e0b)]",
    dot: "bg-[var(--color-warning,#f59e0b)]",
    label: "Warning",
  },
  error: {
    bg: "bg-[var(--color-error-bg,rgba(239,68,68,0.12))]",
    text: "text-[var(--color-error,#ef4444)]",
    dot: "bg-[var(--color-error,#ef4444)]",
    label: "Error",
  },
  unknown: {
    bg: "bg-[var(--bg-elevated,rgba(255,255,255,0.04))]",
    text: "text-[var(--text-muted,#94a3b8)]",
    dot: "bg-[var(--text-muted,#94a3b8)]",
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
