import { memo, useMemo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Card } from "@shared/components/primitives/ui";

import type { TimelineSeries } from "../types";

import { TimelineChart } from "./TimelineChart";
import { TimelineHeader } from "./TimelineHeader";

interface Props {
  compare: DeploymentCompareResponse;
  isLoading: boolean;
  timeline: { timestamps: number[]; series: TimelineSeries[] } | null;
}

function DeploymentCompareTimelineComponent({ compare, isLoading, timeline }: Props) {
  const version = compare.deployment.version;
  const weightedSeries = useMemo(
    () =>
      timeline?.series.map((series) => ({
        ...series,
        width: series.label === version ? 2.4 : 1.6,
      })) ?? null,
    [timeline, version]
  );

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <TimelineHeader version={version} />
      <TimelineChart isLoading={isLoading} timeline={timeline} weightedSeries={weightedSeries} />
    </Card>
  );
}

export const DeploymentCompareTimeline = memo(DeploymentCompareTimelineComponent);
