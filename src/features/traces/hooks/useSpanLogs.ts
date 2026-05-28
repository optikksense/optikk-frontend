import type { TraceLogsResponse } from "@shared/api/schemas/tracesSchemas";
import { tracesService } from "@shared/api/tracesService";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

/** Fetches trace-scoped logs and filters for the Logs tab in the span detail drawer (O8). */
export function useSpanLogs(traceId: string, spanId: string | null) {
  return useStandardQuery<TraceLogsResponse>({
    queryKey: ["span-logs", traceId, spanId ?? "none"],
    queryFn: () => tracesService.getTraceLogs(traceId),
    enabled: Boolean(traceId && spanId),
    select: (data) => ({
      ...data,
      logs: data.logs.filter((log) => log.span_id === spanId),
    }),
  });
}
