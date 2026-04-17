import { memo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import type { TimelineSeries } from "../types";

interface Props {
  isLoading: boolean;
  timeline: { timestamps: number[]; series: TimelineSeries[] } | null;
  weightedSeries: Array<TimelineSeries & { width: number }> | null;
}

function TimelineChartComponent({ isLoading, timeline, weightedSeries }: Props) {
  if (isLoading) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading version traffic…</div>;
  }
  if (!timeline || !weightedSeries) {
    return <div className="text-[12px] text-[var(--text-muted)]">No version traffic was found.</div>;
  }
  return (
    <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(15,18,25,0.35)] p-3">
      <ObservabilityChart
        timestamps={timeline.timestamps}
        series={weightedSeries}
        height={250}
        yFormatter={(value) => `${value.toFixed(value >= 10 ? 0 : 1)} rps`}
        legend
      />
    </div>
  );
}

export const TimelineChart = memo(TimelineChartComponent);
