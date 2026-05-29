import { deploymentsApi } from "@shared/api/deployments/deploymentsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useDeploymentList(serviceName: string | undefined) {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "deployment-compare-list",
    async (_teamId, startTime, endTime) =>
      deploymentsApi.getList(serviceName ?? "", startTime, endTime),
    { extraKeys: [serviceName ?? ""], enabled }
  );

  return {
    deployments: query.data?.deployments ?? [],
    total: query.data?.total ?? 0,
    activeVersion: query.data?.active_version ?? "",
    activeEnvironment: query.data?.active_environment ?? "",
    loading: query.isLoading,
  };
}
