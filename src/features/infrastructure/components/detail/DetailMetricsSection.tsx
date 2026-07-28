import type { ReactNode } from "react";

import { Card } from "@shared/components/primitives/ui";

import { type ChartDef, SeriesChartCard, availableCharts } from "../SeriesChartCard";

interface DetailMetricsSectionProps<G extends string> {
  readonly title: string;
  readonly charts: readonly ChartDef<G>[];
  readonly availableMetrics: readonly string[] | null;
  readonly endpoint: string;
  readonly queryKeyPrefix: string;
  /** Header subtitle when no charts are available, e.g. "no system metrics reported". */
  readonly emptyLabel: string;
  /** Body shown when no charts are available, typically a collector-receiver hint. */
  readonly emptyState: ReactNode;
}

// Metrics chart-grid section shared by the host and container detail pages.
export function DetailMetricsSection<G extends string>({
  title,
  charts,
  availableMetrics,
  endpoint,
  queryKeyPrefix,
  emptyLabel,
  emptyState,
}: DetailMetricsSectionProps<G>) {
  const visible = availableCharts(charts, availableMetrics);
  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-foreground">{title}</div>
        <div className="text-[11px] text-foreground-muted">
          {visible.map((c) => c.title.toLowerCase()).join(" · ") || emptyLabel}
        </div>
      </header>
      {visible.length === 0 ? (
        <Card padding="md" className="border-border">
          <div className="grid h-[120px] place-items-center text-center text-[12px] text-foreground-muted">
            <div>{emptyState}</div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((def) => (
            <SeriesChartCard
              key={def.group}
              endpoint={endpoint}
              queryKeyPrefix={queryKeyPrefix}
              def={def}
            />
          ))}
        </div>
      )}
    </section>
  );
}
