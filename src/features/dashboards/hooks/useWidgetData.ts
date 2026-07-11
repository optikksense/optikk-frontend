import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import api from "@/shared/api/http/client";
import { useInView } from "@/shared/hooks/useInView";
import { useTimeRange } from "@/shared/hooks/useTimeRangeQuery";
import { API_CONFIG } from "@config/apiConfig";
import { type ApiErrorShape, toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";
import {
  type DashboardDataSources,
  type DashboardPanelSpec,
  isMetricsQuerySpec,
} from "@shared/types/dashboardConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;
const STALE_MS = 30_000;

interface WidgetDataResult {
  /** Attach to the panel wrapper; data fetches only once this is in view. */
  ref: ReturnType<typeof useInView<HTMLDivElement>>["ref"];
  dataSources: DashboardDataSources;
  isLoading: boolean;
  error: ApiErrorShape | null;
}

/** Stable cache key for the active time range (collapses identical refreshes). */
function rangeKey(timeRange: ReturnType<typeof useTimeRange>["timeRange"]): string {
  return timeRange.kind === "relative"
    ? timeRange.preset
    : `${timeRange.startMs}-${timeRange.endMs}`;
}

/**
 * Governed widget executor: resolves the curated endpoint from spec.query,
 * fetches only when the panel scrolls into view, dedups identical queries via
 * react-query, and shares the page-global time range for maximal cache reuse.
 */
export function useWidgetData(spec: DashboardPanelSpec): WidgetDataResult {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "100px", once: true });
  const { selectedTenantId, timeRange, getTimeRange } = useTimeRange();

  const endpointQuery = isMetricsQuerySpec(spec.query) ? undefined : spec.query;
  const endpoint = endpointQuery?.endpoint;
  const params = endpointQuery?.params;
  const enabled = Boolean(inView && endpoint && selectedTenantId);

  const query = useStandardQuery({
    queryKey: ["dashboard-widget", selectedTenantId, endpoint, params, rangeKey(timeRange)],
    queryFn: async () => {
      const { startTime, endTime } = getTimeRange();
      const raw = await api.get<unknown>(`${V1}${endpoint}`, {
        params: { ...params, startTime, endTime },
      });
      return unwrapEnvelope<unknown>(raw);
    },
    enabled,
    staleTime: STALE_MS,
  });

  const sourceKey = spec.dataSource ?? spec.id;
  return {
    ref,
    dataSources: { [sourceKey]: query.data as DashboardDataSources[string] },
    isLoading: enabled && query.isLoading,
    error: query.error ? toApiErrorShape(query.error) : null,
  };
}
