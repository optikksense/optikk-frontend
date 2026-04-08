import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Sparkles, X } from "lucide-react";

/**
 *
 */
export interface AnomalyEvent {
  summary: string;
  service: string;
  timestamp: string;
  correlatedEvent?: string;
  severity: "info" | "warning" | "critical";
}

interface AiNarrationCardProps {
  anomaly: AnomalyEvent | null;
  onDismiss: () => void;
  onInvestigate: () => void;
}

export default function AiNarrationCard({
  anomaly,
  onDismiss,
  onInvestigate,
}: AiNarrationCardProps) {
  if (!anomaly) return null;

  const isWarning = anomaly.severity === "warning";
  const isCritical = anomaly.severity === "critical";

  return (
    <div
      className={cn(
        "relative mb-[var(--space-section-gap,20px)] flex items-start gap-3 rounded-[var(--card-radius,12px)] border-l-[3px] px-4 py-3.5",
        !isWarning &&
          !isCritical &&
          "border-l-[var(--color-ai-accent)] bg-[var(--color-ai-subtle)]",
        isWarning && "border-l-[var(--color-degraded)] bg-[var(--severity-medium-subtle)]",
        isCritical && "border-l-[var(--color-critical)] bg-[var(--severity-critical-subtle)]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          !isWarning &&
            !isCritical &&
            "bg-[var(--color-ai-subtle)] text-[color:var(--color-ai-accent)]",
          isWarning && "bg-[var(--severity-medium-subtle)] text-[color:var(--color-degraded)]",
          isCritical && "bg-[var(--severity-critical-subtle)] text-[color:var(--color-critical)]"
        )}
      >
        <Sparkles size={14} />
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="m-0 text-[color:var(--text-primary)] text-[var(--text-sm,13px)] leading-[1.5]">
          {anomaly.summary}
        </p>
        {anomaly.correlatedEvent && (
          <p className="m-0 text-[color:var(--text-secondary)] text-[var(--text-xs,11px)]">
            Correlated: {anomaly.correlatedEvent}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onInvestigate}
            className="h-[26px] border-[var(--color-ai-accent)] px-2.5 text-[color:var(--color-ai-accent)] text-[var(--text-xs,11px)]"
          >
            Investigate
          </Button>
        </div>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[color:var(--text-muted)] transition-[color,background] duration-150 hover:bg-[var(--bg-hover)] hover:text-[color:var(--text-primary)]"
        onClick={onDismiss}
        title="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
