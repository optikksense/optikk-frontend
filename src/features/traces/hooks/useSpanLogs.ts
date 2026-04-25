import { tracesService } from "@shared/api/tracesService";
import type { TraceLogsResponse } from "@shared/api/schemas/tracesSchemas";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

/** Fetches span-scoped logs for the Logs tab in the span detail drawer (O8). */
export function useSpanLogs(traceId: string, spanId: string | null) {
  return useStandardQuery<TraceLogsResponse>({
    queryKey: ["span-logs", traceId, spanId ?? "none"],
    queryFn: () => tracesService.getSpanLogs(traceId, spanId as string),
    enabled: Boolean(traceId && spanId),
  });
}
