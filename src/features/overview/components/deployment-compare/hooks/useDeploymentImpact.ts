import { deploymentsApi } from "@shared/api/deployments/deploymentsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useDeploymentImpact(serviceName: string | undefined) {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "deployment-compare-impact",
    async (_teamId, startTime, endTime) =>
      deploymentsApi.getImpact(serviceName ?? "", startTime, endTime),
    { extraKeys: [serviceName ?? ""], enabled }
  );

  return {
    impacts: query.data?.impacts ?? [],
    loading: query.isLoading,
  };
}
