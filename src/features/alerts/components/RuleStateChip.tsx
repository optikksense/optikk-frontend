import { AlertCircle, AlertTriangle, Ban, CheckCircle2, HelpCircle } from "lucide-react";

import type { AlertRuleState } from "../types";

const CONFIG: Record<
  AlertRuleState,
  { label: string; icon: typeof CheckCircle2; cls: string }
> = {
  ok: {
    label: "OK",
    icon: CheckCircle2,
    cls: "border-[rgba(115,201,145,0.28)] bg-[rgba(115,201,145,0.12)] text-[var(--color-success)]",
  },
  warn: {
    label: "Warn",
    icon: AlertTriangle,
    cls: "border-[rgba(247,144,9,0.28)] bg-[rgba(247,144,9,0.12)] text-[var(--color-warning)]",
  },
  alert: {
    label: "Alert",
    icon: AlertCircle,
    cls: "border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.12)] text-[var(--color-danger)]",
  },
  no_data: {
    label: "No Data",
    icon: HelpCircle,
    cls: "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
  },
  muted: {
    label: "Muted",
    icon: Ban,
    cls: "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
  },
};

interface RuleStateChipProps {
  readonly state: AlertRuleState;
  readonly size?: "sm" | "md";
}

export function RuleStateChip({ state, size = "sm" }: RuleStateChipProps) {
  const cfg = CONFIG[state];
  const Icon = cfg.icon;
  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const text = size === "sm" ? "text-[10px]" : "text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--card-radius)] border font-semibold uppercase tracking-[0.06em] ${cfg.cls} ${px} ${text}`}
    >
      <Icon size={size === "sm" ? 10 : 12} />
      {cfg.label}
    </span>
  );
}
