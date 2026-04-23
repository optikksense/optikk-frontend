import { queryLogs } from "@features/log/api/logsExplorerApi";
import type { LogRecord, LogsQueryResponse } from "@features/log/types/log";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useCorrelatedErrorLogs(
  serviceName: string,
  limit = 20,
): {
  logs: readonly LogRecord[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery<LogsQueryResponse>(
    "service-page-correlated-error-logs",
    (_teamId, startTime, endTime) =>
      queryLogs({
        startTime: Number(startTime),
        endTime: Number(endTime),
        filters: [
          { field: "service_name", op: "eq", value: serviceName },
          { field: "severity_bucket", op: "gte", value: "4" },
        ],
        limit,
        include: [],
      }),
    { extraKeys: [serviceName, limit], enabled },
  );

  const logs = query.data?.results ?? [];
  return { logs, loading: query.isLoading && logs.length === 0 };
}
