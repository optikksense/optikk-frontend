import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { queryLogs } from "@shared/logs/api/logsQueryApi";
import type { LogsQueryResponse } from "@shared/logs/types/log";

export function useServiceLogs(serviceName: string, limit = 25, cursor?: string) {
  return useTimeRangeQuery<LogsQueryResponse>(
    "service-detail.logs",
    (_tenant, start, end) =>
      queryLogs({
        startTime: Number(start),
        endTime: Number(end),
        filters: [{ field: "service_name", op: "eq", value: serviceName }],
        limit,
        cursor,
      }),
    { extraKeys: [serviceName, limit, cursor], enabled: Boolean(serviceName) }
  );
}
