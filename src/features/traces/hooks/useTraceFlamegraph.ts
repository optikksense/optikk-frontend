import { tracesService } from "@shared/api/tracesService";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { flamegraphFramesToTree } from "../utils/flamegraphFromFrames";

import type { FlamegraphNode } from "../types";

export function useTraceFlamegraph(traceId: string, enabled: boolean) {
  return useStandardQuery({
    queryKey: ["trace-flamegraph", traceId],
    queryFn: async (): Promise<FlamegraphNode | null> => {
      const frames = await tracesService.getFlamegraphData(traceId);
      return flamegraphFramesToTree(frames);
    },
    enabled: !!traceId && enabled,
  });
}
