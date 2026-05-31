import { queryLogs } from "@/features/log/api/logsQueryApi";
import type { LogsQueryResponse } from "@/features/log/types/log";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useServiceLogs(serviceName: string, limit = 25, cursor?: string) {
  return useTimeRangeQuery<LogsQueryResponse>(
    "service-detail.logs",
    (_team, start, end) =>
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
