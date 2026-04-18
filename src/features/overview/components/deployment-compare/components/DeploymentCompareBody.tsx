import type { UseQueryResult } from "@tanstack/react-query";
import { memo } from "react";

import type {
  DeploymentCompareResponse,
  DeploymentImpactRow,
  DeploymentRow,
} from "@/features/overview/api/deploymentsApi";

import type { TimelineSeries } from "../types";

import { DeploymentCompareAdjacentNav } from "./DeploymentCompareAdjacentNav";
import { DeploymentCompareBaselinePicker } from "./DeploymentCompareBaselinePicker";
import { DeploymentCompareCommitMeta } from "./DeploymentCompareCommitMeta";
import { DeploymentCompareEndpointHeatmap } from "./DeploymentCompareEndpointHeatmap";
import { DeploymentCompareEndpoints } from "./DeploymentCompareEndpoints";
import { DeploymentCompareErrors } from "./DeploymentCompareErrors";
import { DeploymentCompareHealthScore } from "./DeploymentCompareHealthScore";
import { DeploymentCompareImpact } from "./DeploymentCompareImpact";
import { DeploymentCompareLogVolumeDiff } from "./DeploymentCompareLogVolumeDiff";
import { DeploymentCompareRolloutProgress } from "./DeploymentCompareRolloutProgress";
import { DeploymentCompareSampleTraces } from "./DeploymentCompareSampleTraces";
import { DeploymentCompareSummary } from "./DeploymentCompareSummary";
import { DeploymentCompareTimeline } from "./DeploymentCompareTimeline";
import { DeploymentCompareWindow } from "./DeploymentCompareWindow";

interface Props {
  compare: DeploymentCompareResponse;
  onOpen: (target: "logs" | "traces", startMs: number, endMs: number) => void;
  timelineIsLoading: boolean;
  timeline: { timestamps: number[]; series: TimelineSeries[] } | null;
  serviceName: string;
  currentVersion: string;
  impacts: readonly DeploymentImpactRow[];
  impactsLoading: boolean;
  deployments: readonly DeploymentRow[];
}

function EnrichmentRow({
  serviceName,
  currentVersion,
  deployments,
}: {
  serviceName: string;
  currentVersion: string;
  deployments: readonly DeploymentRow[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <DeploymentCompareBaselinePicker
        serviceName={serviceName}
        deployments={deployments}
        currentVersion={currentVersion}
      />
      <DeploymentCompareAdjacentNav
        serviceName={serviceName}
        deployments={deployments}
        currentVersion={currentVersion}
      />
    </div>
  );
}

function DeploymentCompareBodyComponent({
  compare,
  onOpen,
  timelineIsLoading,
  timeline,
  serviceName,
  currentVersion,
  impacts,
  impactsLoading,
  deployments,
}: Props) {
  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      <EnrichmentRow
        serviceName={serviceName}
        currentVersion={currentVersion}
        deployments={deployments}
      />
      <DeploymentCompareHealthScore compare={compare} />
      <DeploymentCompareCommitMeta compare={compare} />
      <DeploymentCompareSummary compare={compare} />
      <DeploymentCompareWindow compare={compare} onOpen={onOpen} />
      <DeploymentCompareTimeline
        compare={compare}
        isLoading={timelineIsLoading}
        timeline={timeline}
      />
      <DeploymentCompareRolloutProgress compare={compare} timeline={timeline} />
      <DeploymentCompareImpact
        serviceName={serviceName}
        impacts={impacts}
        isLoading={impactsLoading}
      />
      <DeploymentCompareEndpointHeatmap compare={compare} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DeploymentCompareErrors compare={compare} />
        <DeploymentCompareEndpoints compare={compare} />
      </div>
      <DeploymentCompareLogVolumeDiff compare={compare} />
      <DeploymentCompareSampleTraces compare={compare} />
    </div>
  );
}

export const DeploymentCompareBody = memo(DeploymentCompareBodyComponent);
export type { UseQueryResult };
