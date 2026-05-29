import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type DeploymentImpactResponse,
  deploymentsApi,
} from "@shared/api/deployments/deploymentsApi";

export function useServiceDeployImpact(serviceName: string) {
  return useTimeRangeQuery<DeploymentImpactResponse>(
    "service-detail.deploy-impact",
    (_team, start, end) => deploymentsApi.getImpact(serviceName, start, end),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
