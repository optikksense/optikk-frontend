import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { queryErrorOverview } from "@shared/errors/api/errorsExplorerApi";
import type { ErrorsOverview } from "@shared/errors/api/types";

/** Grouped-issue count for the service's Errors tab badge — exact, not a page sample. */
export function useServiceErrorCount(serviceName: string): number | null {
  const query = useTimeRangeQuery<ErrorsOverview>(
    "service-detail.error-overview",
    (_tenant, start, end) =>
      queryErrorOverview({
        startTime: Number(start),
        endTime: Number(end),
        filters: [{ field: "service", op: "eq", value: serviceName }],
      }),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
  return query.data?.summary.activeIssues ?? null;
}
