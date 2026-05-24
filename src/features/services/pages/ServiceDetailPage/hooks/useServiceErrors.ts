import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type ErrorGroup, listErrorGroups } from "@/features/errors/api/errorGroupsApi";

export function useServiceErrors(serviceName: string, limit = 25) {
  return useTimeRangeQuery<ErrorGroup[]>(
    "service-detail.error-groups",
    (_team, start, end) => listErrorGroups(start, end, { serviceName, limit }),
    { extraKeys: [serviceName, limit], enabled: Boolean(serviceName) }
  );
}
