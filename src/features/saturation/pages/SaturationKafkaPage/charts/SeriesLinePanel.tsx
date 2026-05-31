import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

interface SeriesLinePanelProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly timestamps: number[];
  readonly series: ObservabilityChartSeries[];
  readonly emptyLabel: string;
  readonly type?: "line" | "area";
  readonly yFormatter: (value: number) => string;
  readonly height?: number;
}

/** Single-purpose wrapper: a PanelCard wrapping an ObservabilityChart with an empty state. */
export function SeriesLinePanel({
  title,
  subtitle,
  timestamps,
  series,
  emptyLabel,
  type = "line",
  yFormatter,
  height = 220,
}: SeriesLinePanelProps) {
  return (
    <PanelCard title={title} subtitle={subtitle}>
      {timestamps.length === 0 ? (
        <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
          {emptyLabel}
        </div>
      ) : (
        <ObservabilityChart
          type={type}
          timestamps={timestamps}
          series={series}
          height={height}
          yFormatter={yFormatter}
        />
      )}
    </PanelCard>
  );
}
