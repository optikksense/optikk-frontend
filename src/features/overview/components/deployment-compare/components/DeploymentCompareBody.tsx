import type { UseQueryResult } from "@tanstack/react-query";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";

import type { TimelineSeries } from "../types";

import { DeploymentCompareEndpoints } from "./DeploymentCompareEndpoints";
import { DeploymentCompareErrors } from "./DeploymentCompareErrors";
import { DeploymentCompareSummary } from "./DeploymentCompareSummary";
import { DeploymentCompareTimeline } from "./DeploymentCompareTimeline";
import { DeploymentCompareWindow } from "./DeploymentCompareWindow";

interface Props {
  compare: DeploymentCompareResponse;
  onOpen: (target: "logs" | "traces", startMs: number, endMs: number) => void;
  timelineIsLoading: boolean;
  timeline: { timestamps: number[]; series: TimelineSeries[] } | null;
}

function DeploymentCompareBodyComponent({ compare, onOpen, timelineIsLoading, timeline }: Props) {
  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      <DeploymentCompareSummary compare={compare} />
      <DeploymentCompareWindow compare={compare} onOpen={onOpen} />
      <DeploymentCompareTimeline
        compare={compare}
        isLoading={timelineIsLoading}
        timeline={timeline}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DeploymentCompareErrors compare={compare} />
        <DeploymentCompareEndpoints compare={compare} />
      </div>
    </div>
  );
}

export const DeploymentCompareBody = memo(DeploymentCompareBodyComponent);
export type { UseQueryResult };
