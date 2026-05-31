import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { cn } from "@/lib/utils";

import { useKafkaBrokers } from "../hooks/useKafkaBrokers";

function toneClasses(pct: number): { fill: string; badge: string } {
  if (pct >= 90) return { fill: "bg-error", badge: "bg-error-subtle text-error" };
  if (pct >= 70) return { fill: "bg-warning", badge: "bg-warning-subtle text-warning" };
  return { fill: "bg-success", badge: "bg-success-subtle text-success" };
}

function shortLabel(host: string): string {
  const parts = host.split(/[-.]/).filter(Boolean);
  return parts[parts.length - 1] || host;
}

export function BrokerCpuGrid() {
  const { brokers, isPending } = useKafkaBrokers();
  return (
    <PanelCard
      title="Brokers · CPU saturation"
      subtitle={brokers.length > 0 ? `${brokers.length} brokers · color shows CPU max` : undefined}
      padded={false}
    >
      {brokers.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No broker hosts in window."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[10px] p-4 sm:grid-cols-3 lg:grid-cols-5">
          {brokers.map((b) => {
            const tone = toneClasses(b.cpu);
            return (
              <div key={b.host} className="rounded-lg border border-border bg-[var(--bg-2)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="truncate font-mono font-semibold text-[12px] text-foreground"
                    title={b.host}
                  >
                    {shortLabel(b.host)}
                  </span>
                  <span
                    className={cn("rounded px-[6px] py-px font-semibold text-[11.5px]", tone.badge)}
                  >
                    {Math.round(b.cpu)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-[var(--bg-1)]">
                  <div
                    className={cn("h-full rounded", tone.fill)}
                    style={{ width: `${Math.min(100, Math.max(0, b.cpu))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PanelCard>
  );
}
