import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useTeamId } from "@store/appStore";

import {
  type ServiceLatestDeployment,
  deploymentsApi,
} from "@/features/overview/api/deploymentsApi";

export interface RecentDeploy extends ServiceLatestDeployment {
  readonly deployedAtMs: number;
}

function toRecent(row: ServiceLatestDeployment): RecentDeploy {
  const ms = row.deployed_at ? new Date(row.deployed_at).getTime() : Number.NaN;
  return { ...row, deployedAtMs: Number.isFinite(ms) ? ms : 0 };
}

function sortNewestFirst(rows: RecentDeploy[]): RecentDeploy[] {
  return [...rows].sort((a, b) => b.deployedAtMs - a.deployedAtMs);
}

export function useRecentDeploys(limit = 50): { rows: RecentDeploy[]; isPending: boolean } {
  const teamId = useTeamId();
  const query = useQuery<ServiceLatestDeployment[]>({
    queryKey: ["service-hub.recent-deploys", teamId],
    queryFn: () => deploymentsApi.getLatestByService(),
    enabled: Boolean(teamId),
    staleTime: 60_000,
  });
  const rows = useMemo(
    () => sortNewestFirst((query.data ?? []).map(toRecent)).slice(0, limit),
    [query.data, limit]
  );
  return { rows, isPending: query.isPending };
}
