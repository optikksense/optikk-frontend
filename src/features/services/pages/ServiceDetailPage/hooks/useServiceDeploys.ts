import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type DeploymentListResponse,
  deploymentsApi,
} from "@shared/api/deployments/deploymentsApi";

export function useServiceDeploys(serviceName: string) {
  return useTimeRangeQuery<DeploymentListResponse>(
    "service-detail.deploys",
    (_team, start, end) => deploymentsApi.getList(serviceName, start, end),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
