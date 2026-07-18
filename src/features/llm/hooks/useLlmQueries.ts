import { useMemo } from "react";

import { useRefreshKey, useTenantId, useTimeRange } from "@/app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { resolveTimeRangeBounds } from "@shared/types";

import {
  type LlmCostGroupBy,
  type LlmTimeseriesMetric,
  type LlmTracesRequest,
  getLlmApps,
  getLlmCostBreakdown,
  getLlmOverview,
  getLlmTimeseries,
  getLlmTraceDetail,
  queryLlmTraces,
} from "../api/llmApi";

// Shared page context: selected tenant + resolved time window + refresh tick.
export function useLlmRange() {
  const timeRange = useTimeRange();
  const tenantId = useTenantId();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  return { tenantId, refreshKey, startTime, endTime };
}

export function useLlmOverview() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "overview", tenantId, startTime, endTime, refreshKey],
    queryFn: () => getLlmOverview({ startTime, endTime }),
  });
}

export function useLlmApps() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "apps", tenantId, startTime, endTime, refreshKey],
    queryFn: () => getLlmApps({ startTime, endTime }),
  });
}

export function useLlmTimeseries(metric: LlmTimeseriesMetric, enabled = true) {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "timeseries", metric, tenantId, startTime, endTime, refreshKey],
    queryFn: () => getLlmTimeseries(metric, { startTime, endTime }),
    enabled,
  });
}

export function useLlmCostBreakdown(groupBy: LlmCostGroupBy, enabled = true) {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "cost", groupBy, tenantId, startTime, endTime, refreshKey],
    queryFn: () => getLlmCostBreakdown(groupBy, { startTime, endTime }),
    enabled,
  });
}

export function useLlmTraces(req: Omit<LlmTracesRequest, "startTime" | "endTime">, enabled = true) {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "traces", tenantId, startTime, endTime, refreshKey, JSON.stringify(req)],
    queryFn: () => queryLlmTraces({ ...req, startTime, endTime }),
    enabled,
  });
}

export function useLlmTraceDetail(traceId: string | null) {
  const tenantId = useTenantId();
  return useStandardQuery({
    queryKey: ["llm", "traceDetail", tenantId, traceId],
    queryFn: () => getLlmTraceDetail(traceId ?? ""),
    enabled: Boolean(traceId),
  });
}
