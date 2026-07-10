import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { PaginatedResponse } from "@/shared/api/service-types";
import { type ErrorGroup, listErrorGroups } from "@shared/api/errors";

export function useServiceErrors(serviceName: string, limit = 25, cursor?: string) {
  return useTimeRangeQuery<PaginatedResponse<ErrorGroup[]>>(
    "service-detail.error-groups",
    (_tenant, start, end) => listErrorGroups(start, end, { serviceName, limit, cursor }),
    { extraKeys: [serviceName, limit, cursor], enabled: Boolean(serviceName) }
  );
}
