import { memo, useMemo } from "react";

import type { DeploymentCompareResponse } from "@shared/api/deployments/deploymentsApi";
import { Card } from "@shared/components/primitives/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import type { TimelineSeries } from "../types";

interface Props {
  readonly compare: DeploymentCompareResponse;
  readonly timeline: { timestamps: number[]; series: TimelineSeries[] } | null;
}

interface ShareSeries {
  readonly label: string;
  readonly values: Array<number | null>;
  readonly color: string;
}

function totalAt(series: TimelineSeries[], index: number): number {
  return series.reduce((sum, entry) => sum + (entry.values[index] ?? 0), 0);
}

function sharesForRelease(
  timeline: { timestamps: number[]; series: TimelineSeries[] },
  releaseVersion: string
): ShareSeries[] {
  const releaseSeries = timeline.series.find((entry) => entry.label === releaseVersion);
  if (!releaseSeries) return [];
  const shareValues = timeline.timestamps.map((_ts, index) => {
    const total = totalAt(timeline.series, index);
    if (total <= 0) return null;
    return ((releaseSeries.values[index] ?? 0) / total) * 100;
  });
  return [{ label: `${releaseVersion} share`, values: shareValues, color: "var(--color-primary)" }];
}

function DeploymentCompareRolloutProgressComponent({ compare, timeline }: Props) {
  const releaseVersion = compare.deployment.version;
  const series = useMemo(
    () => (timeline ? sharesForRelease(timeline, releaseVersion) : []),
    [timeline, releaseVersion]
  );

  if (!timeline || series.length === 0 || timeline.timestamps.length === 0) return null;

  return (
    <Card padding="lg" className="border-[var(--border-light)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="m-0 font-semibold text-[var(--text-primary)]">Rollout progress</h3>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            Share of total request volume served by {releaseVersion} over time.
          </p>
        </div>
      </div>
      <ObservabilityChart
        timestamps={timeline.timestamps}
        series={series}
        type="area"
        yFormatter={(value) => `${value.toFixed(0)}%`}
        yMin={0}
        yMax={100}
        height={200}
      />
    </Card>
  );
}

export const DeploymentCompareRolloutProgress = memo(DeploymentCompareRolloutProgressComponent);
