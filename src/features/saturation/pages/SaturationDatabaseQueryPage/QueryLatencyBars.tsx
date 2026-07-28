import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtMs } from "@shared/utils/formatters";

interface Bar {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

export function QueryLatencyBars({ row }: { row: SlowQueryPatternRow }) {
  const bars: Bar[] = [
    { label: "p50", value: row.p50Ms ?? 0, color: "var(--color-info)" },
    { label: "p95", value: row.p95Ms ?? 0, color: "var(--color-warning)" },
    { label: "p99", value: row.p99Ms ?? 0, color: "var(--color-error)" },
  ];
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <PanelCard title="Latency distribution" subtitle="p50 / p95 / p99">
      <div className="flex flex-col gap-3 py-1">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="w-8 font-mono text-[12px] text-foreground-muted">{bar.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${(bar.value / max) * 100}%`, backgroundColor: bar.color }}
              />
            </div>
            <span className="w-16 text-right font-mono text-[12px] text-foreground">
              {fmtMs(bar.value)}
            </span>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
