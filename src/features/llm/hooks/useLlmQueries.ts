import { useResolvedTimeBounds } from "@/app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type LlmCostGroupBy,
  type LlmTimeseriesMetric,
  type LlmTracesRequest,
  getLlmApps,
  getLlmCostBreakdown,
  getLlmModels,
  getLlmOverview,
  getLlmTimeseries,
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

export function useLlmApps() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "apps", startTime, endTime],
    queryFn: () => getLlmApps({ startTime, endTime }),
  });
}

export function useLlmTimeseries(metric: LlmTimeseriesMetric, enabled = true) {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "timeseries", metric, startTime, endTime],
    queryFn: () => getLlmTimeseries(metric, { startTime, endTime }),
    enabled,
  });
}

export function useLlmCostBreakdown(groupBy: LlmCostGroupBy, enabled = true) {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "cost", groupBy, startTime, endTime],
    queryFn: () => getLlmCostBreakdown(groupBy, { startTime, endTime }),
    enabled,
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
