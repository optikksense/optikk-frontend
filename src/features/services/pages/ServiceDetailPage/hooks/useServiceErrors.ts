import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type ErrorGroup, listErrorGroups } from "@/features/errors/api/errorGroupsApi";
import type { PaginatedResponse } from "@/features/services/api/serviceDetailApi";

export function useServiceErrors(serviceName: string, limit = 25, cursor?: string) {
  return useTimeRangeQuery<PaginatedResponse<ErrorGroup[]>>(
    "service-detail.error-groups",
    (_team, start, end) => listErrorGroups(start, end, { serviceName, limit, cursor }),
    { extraKeys: [serviceName, limit, cursor], enabled: Boolean(serviceName) }
  );
}
