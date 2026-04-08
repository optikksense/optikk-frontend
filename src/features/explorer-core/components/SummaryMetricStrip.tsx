import { AlertTriangle, ArrowUpRight, Gauge, Sparkles } from "lucide-react";

import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { SummaryMetric } from "../types";

const toneClasses: Record<NonNullable<SummaryMetric["tone"]>, string> = {
  default: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
  success: "border-[rgba(51,211,145,0.22)] bg-[rgba(51,211,145,0.08)]",
  warning: "border-[rgba(247,144,9,0.22)] bg-[rgba(247,144,9,0.08)]",
  danger: "border-[rgba(240,68,56,0.22)] bg-[rgba(240,68,56,0.08)]",
  accent: "border-[rgba(77,166,200,0.28)] bg-[rgba(77,166,200,0.12)]",
};

function iconForTone(tone: SummaryMetric["tone"]): JSX.Element {
  switch (tone) {
    case "success":
      return <Sparkles size={14} />;
    case "warning":
      return <Gauge size={14} />;
    case "danger":
      return <AlertTriangle size={14} />;
    case "accent":
      return <ArrowUpRight size={14} />;
    default:
      return <Gauge size={14} />;
  }
}

export function SummaryMetricStrip({ metrics }: { metrics: SummaryMetric[] }): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card
          key={metric.key}
          padding="lg"
          className={cn(
            "min-h-[112px] border shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
            toneClasses[metric.tone ?? "default"]
          )}
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-[0.12em]">
            <span>{metric.label}</span>
            <span className="rounded-full border border-current/10 bg-black/10 p-1">
              {iconForTone(metric.tone)}
            </span>
          </div>
          <div className="mt-4 font-semibold text-[28px] text-[var(--text-primary)] leading-none">
            {metric.value}
          </div>
          {metric.hint ? (
            <p className="mt-3 text-[var(--text-secondary)] text-xs leading-5">{metric.hint}</p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
