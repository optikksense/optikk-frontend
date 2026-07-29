import type { ReactNode } from "react";

import { Card } from "@shared/components/primitives/ui/card";

import { type ChartDef, SeriesChartCard, availableCharts } from "../SeriesChartCard";

interface DetailMetricsSectionProps<G extends string> {
  readonly title: string;
  readonly charts: readonly ChartDef<G>[];
  readonly availableMetrics: readonly string[] | null;
  readonly endpoint: string;
  readonly queryKeyPrefix: string;
  /** Header subtitle. Defaults to the list of visible chart titles. */
  readonly subtitle?: string;
  /**
   * Body shown when no charts are available, typically a collector-receiver
   * hint. Omit to render nothing at all when there is nothing to show.
   */
  readonly emptyState?: ReactNode;
  /** Header subtitle used in place of `subtitle` when no charts are available. */
  readonly emptyLabel?: string;
}

// Metrics chart-grid section shared by the host and container detail pages.
export function DetailMetricsSection<G extends string>({
  title,
  charts,
  availableMetrics,
  endpoint,
  queryKeyPrefix,
  subtitle,
  emptyState,
  emptyLabel,
}: DetailMetricsSectionProps<G>) {
  const visible = availableCharts(charts, availableMetrics);
  if (visible.length === 0 && emptyState === undefined) return null;

  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-foreground">{title}</div>
        <div className="text-[11px] text-foreground-muted">
          {visible.length === 0
            ? emptyLabel
            : (subtitle ?? visible.map((c) => c.title.toLowerCase()).join(" · "))}
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
