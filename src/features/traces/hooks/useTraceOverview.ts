import { tracesService } from "@shared/api/tracesService";
import type { ServiceMapResponse, TraceErrorGroup } from "@shared/api/schemas/tracesSchemas";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

/** Paired fetch of service-map + trace-errors for the overview panel (Phase 4). */
export function useTraceServiceMap(traceId: string, enabled: boolean) {
  return useStandardQuery<ServiceMapResponse>({
    queryKey: ["trace-service-map", traceId],
    queryFn: () => tracesService.getServiceMap(traceId),
    enabled: enabled && traceId !== "",
  });
}

export function useTraceErrors(traceId: string, enabled: boolean) {
  return useStandardQuery<TraceErrorGroup[]>({
    queryKey: ["trace-errors", traceId],
    queryFn: () => tracesService.getTraceErrors(traceId),
    enabled: enabled && traceId !== "",
  });
}
