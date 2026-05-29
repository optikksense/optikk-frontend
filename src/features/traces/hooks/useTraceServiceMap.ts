import { tracesService } from "@shared/api/tracesService";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";

/**
 * Per-trace service map (nodes = services with span/error counts + total time,
 * edges = service-to-service calls). Used to build the service-time breakdown
 * bar. Immutable per trace, so it shares the long-cache query policy.
 */
export function useTraceServiceMap(traceId: string) {
  return useStandardQuery({
    queryKey: ["trace-service-map", traceId],
    queryFn: () => tracesService.getServiceMap(traceId),
    enabled: !!traceId,
  });
}
