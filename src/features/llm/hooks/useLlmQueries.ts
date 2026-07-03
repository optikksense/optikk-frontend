import { useMemo } from "react";

import { useRefreshKey, useTeamId, useTimeRange } from "@/app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type LlmCostGroupBy,
  type LlmTimeseriesMetric,
  type LlmTracesRequest,
  getLlmApps,
  getLlmCostBreakdown,
  getLlmTimeseries,
  getLlmTraceDetail,
  queryLlmTraces,
} from "../api/llmApi";

// Shared page context: selected team + resolved time window + refresh tick.
function useLlmRange() {
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  return { teamId, refreshKey, startTime, endTime };
}

export function useLlmApps() {
  const { teamId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "apps", teamId, startTime, endTime, refreshKey],
    queryFn: () => getLlmApps({ startTime, endTime }),
  });
}

export function useLlmTimeseries(metric: LlmTimeseriesMetric, enabled = true) {
  const { teamId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "timeseries", metric, teamId, startTime, endTime, refreshKey],
    queryFn: () => getLlmTimeseries(metric, { startTime, endTime }),
    enabled,
  });
}

export function useLlmCostBreakdown(groupBy: LlmCostGroupBy, enabled = true) {
  const { teamId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "cost", groupBy, teamId, startTime, endTime, refreshKey],
    queryFn: () => getLlmCostBreakdown(groupBy, { startTime, endTime }),
    enabled,
  });
}

export function useLlmTraces(req: Omit<LlmTracesRequest, "startTime" | "endTime">, enabled = true) {
  const { teamId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "traces", teamId, startTime, endTime, refreshKey, JSON.stringify(req)],
    queryFn: () => queryLlmTraces({ ...req, startTime, endTime }),
    enabled,
  });
}

export function useLlmTraceDetail(traceId: string | null) {
  const teamId = useTeamId();
  return useStandardQuery({
    queryKey: ["llm", "traceDetail", teamId, traceId],
    queryFn: () => getLlmTraceDetail(traceId ?? ""),
    enabled: Boolean(traceId),
  });
}
