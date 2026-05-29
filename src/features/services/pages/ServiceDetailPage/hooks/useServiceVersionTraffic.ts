import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type DeploymentVersionTrafficPoint,
  deploymentsApi,
} from "@shared/api/deployments/deploymentsApi";

export function useServiceVersionTraffic(serviceName: string) {
  return useTimeRangeQuery<DeploymentVersionTrafficPoint[]>(
    "service-detail.version-traffic",
    (_team, start, end) => deploymentsApi.getVersionTraffic(serviceName, start, end),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
