import { useResolvedTimeBounds } from "@/app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type LlmTracesRequest,
  getLlmModels,
  getLlmOverview,
  getLlmTraceDetail,
  queryLlmTraces,
} from "../api/llmApi";

export function useLlmRange() {
  // Store-resolved bounds: stable across renders, advance on refresh.
  const { startTime, endTime } = useResolvedTimeBounds();
  return { startTime, endTime };
}

export function useLlmOverview() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "overview", startTime, endTime],
    queryFn: () => getLlmOverview({ startTime, endTime }),
  });
}

export function useLlmTraces(req: Omit<LlmTracesRequest, "startTime" | "endTime">, enabled = true) {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "traces", startTime, endTime, JSON.stringify(req)],
    queryFn: () => queryLlmTraces({ ...req, startTime, endTime }),
    enabled,
  });
}

export function useLlmModels() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "models", startTime, endTime],
    queryFn: () => getLlmModels({ startTime, endTime }),
  });
}

export function useLlmTraceDetail(traceId: string | null) {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "traceDetail", traceId, startTime, endTime],
    queryFn: () => getLlmTraceDetail(traceId ?? "", startTime, endTime),
    enabled: Boolean(traceId),
  });
}
