import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { useTeamId } from "@store/appStore";

import {
  type ActiveVersion,
  type ServiceLatestDeployment,
  deploymentsApi,
} from "@shared/api/deployments/deploymentsApi";

import type { ServiceSummary } from "./useServiceSummary";
import { useServiceSummary } from "./useServiceSummary";

export type HeroStatus = "healthy" | "warn" | "error" | "unknown";

export interface HeroDeployment {
  readonly version: string;
  readonly environment: string;
  readonly deployedAtIso: string | null;
}

export interface HeroData {
  readonly summary: ServiceSummary | null;
  readonly previous: ServiceSummary | null;
  readonly deployment: HeroDeployment | null;
  readonly status: HeroStatus;
  readonly loading: boolean;
}

function classifyStatus(summary: ServiceSummary | null): HeroStatus {
  if (!summary) return "unknown";
  if (summary.errorRate >= 0.02 || summary.p99Ms >= 2000) return "error";
  if (summary.errorRate >= 0.005 || summary.p99Ms >= 1000) return "warn";
  return "healthy";
}

function mergeDeployment(
  active: ActiveVersion | undefined,
  latest: ServiceLatestDeployment | undefined
): HeroDeployment | null {
  if (!active && !latest) return null;
  return {
    version: active?.version || latest?.version || "—",
    environment: active?.environment || latest?.environment || "—",
    deployedAtIso: latest?.deployed_at || null,
  };
}

function useLatestDeploy(serviceName: string) {
  const teamId = useTeamId();
  return useQuery<ServiceLatestDeployment[]>({
    queryKey: ["service-detail.latest-deploys", teamId],
    queryFn: () => deploymentsApi.getLatestByService(),
    enabled: Boolean(teamId) && Boolean(serviceName),
    staleTime: 60_000,
  });
}

export function useServiceHeroData(serviceName: string, windowMs: number): HeroData {
  const summaryQ = useServiceSummary(serviceName, windowMs);
  const versionQ = useTimeRangeQuery<ActiveVersion>(
    "service-detail.active-version",
    (_team, start, end) => deploymentsApi.getActiveVersion(serviceName, start, end),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
  const latestQ = useLatestDeploy(serviceName);
  const latest = useMemo(
    () => latestQ.data?.find((d) => d.service_name === serviceName),
    [latestQ.data, serviceName]
  );
  return {
    summary: summaryQ.summary,
    previous: summaryQ.previous,
    deployment: mergeDeployment(versionQ.data, latest),
    status: classifyStatus(summaryQ.summary),
    loading: summaryQ.isPending || versionQ.isPending || latestQ.isPending,
  };
}
