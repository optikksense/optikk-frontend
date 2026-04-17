import {
  type DeploymentCompareResponse,
  deploymentsApi,
} from "@/features/overview/api/deploymentsApi";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId } from "@app/store/appStore";

export function useVersionTrafficQuery(compare?: DeploymentCompareResponse) {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();

  return useStandardQuery({
    queryKey: [
      "deployment-compare-timeline",
      teamId,
      refreshKey,
      compare?.deployment.service_name,
      compare?.timeline_start_ms,
      compare?.timeline_end_ms,
    ],
    queryFn: async () =>
      deploymentsApi.getVersionTraffic(
        compare?.deployment.service_name ?? "",
        compare?.timeline_start_ms ?? 0,
        compare?.timeline_end_ms ?? 0
      ),
    enabled: Boolean(
      teamId &&
        compare?.deployment.service_name &&
        (compare?.timeline_start_ms ?? 0) < (compare?.timeline_end_ms ?? 0)
    ),
  });
}
