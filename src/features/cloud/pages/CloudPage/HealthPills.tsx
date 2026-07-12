import { HEALTH_COLOR } from "../../constants";
import type { HealthCounts } from "../../types";

// Compact healthy/degraded/unhealthy chips shared by the hero and detail views.
export function HealthPills({ health }: { health: HealthCounts }): JSX.Element {
  const pills: { key: keyof HealthCounts; label: string }[] = [
    { key: "unhealthy", label: "unhealthy" },
    { key: "degraded", label: "degraded" },
    { key: "healthy", label: "healthy" },
  ];
  return (
    <div className="flex items-center gap-2.5">
      {pills.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1.5 text-[12px]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: HEALTH_COLOR[label] }}
            aria-hidden
          />
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {health[key]}
          </span>
          <span className="text-foreground-muted">{label}</span>
        </span>
      ))}
    </div>
  );
}
