import { deploymentsApi } from "@/features/overview/api/deploymentsApi";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId } from "@app/store/appStore";

import type { DeploymentSeed } from "../types";

export function useDeploymentCompareQuery(seed: DeploymentSeed | null) {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();

  return useStandardQuery({
    queryKey: [
      "deployment-compare",
      teamId,
      refreshKey,
      seed?.serviceName,
      seed?.version,
      seed?.environment,
      seed?.deployedAtMs,
    ],
    queryFn: async () =>
      deploymentsApi.getDeploymentCompare({
        serviceName: seed?.serviceName ?? "",
        version: seed?.version ?? "",
        environment: seed?.environment ?? "",
        deployedAt: seed?.deployedAtMs ?? 0,
      }),
    enabled: Boolean(teamId && seed?.serviceName && seed?.version && seed?.deployedAtMs),
  });
}
