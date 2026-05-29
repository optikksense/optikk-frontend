import { useMemo } from "react";

import {
  type ServiceLatestDeployment,
  deploymentsApi,
} from "@shared/api/deployments/deploymentsApi";
import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface DeployRow extends ServiceLatestDeployment {
  readonly deployedAtMs: number;
}

export interface DeploysData {
  readonly rows: DeployRow[];
  readonly inWindowCount: number;
  readonly activeVersions: number;
  readonly isPending: boolean;
}

function toRow(row: ServiceLatestDeployment): DeployRow {
  const ms = row.deployed_at ? new Date(row.deployed_at).getTime() : Number.NaN;
  return { ...row, deployedAtMs: Number.isFinite(ms) ? ms : 0 };
}

/**
 * Single all-services deploy source for the Deploys tab. `latest-by-service` is
 * the only endpoint that spans every service (others require a serviceName), so
 * every deploy KPI/timeline/table here derives from it: one latest deploy per
 * service. Shares its query key with the catalog's latest-deploys query so the
 * two views dedupe to a single request.
 */
export function useDeploysData(): DeploysData {
  const { getTimeRange } = useTimeRange();
  const query = useTimeRangeQuery<ServiceLatestDeployment[]>(
    "service-hub.latest-deploys",
    () => deploymentsApi.getLatestByService(),
    { staleTime: 60_000 }
  );

  return useMemo<DeploysData>(() => {
    const rows = (query.data ?? []).map(toRow).sort((a, b) => b.deployedAtMs - a.deployedAtMs);
    const bounds = getTimeRange();
    const start = Number(bounds.startTime);
    const end = Number(bounds.endTime);
    const inWindow = rows.filter((r) => r.deployedAtMs >= start && r.deployedAtMs <= end);
    const activeVersions = new Set(rows.filter((r) => r.is_active).map((r) => r.version)).size;
    return {
      rows,
      inWindowCount: inWindow.length,
      activeVersions,
      isPending: query.isPending,
    };
  }, [query.data, query.isPending, getTimeRange]);
}
