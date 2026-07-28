import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import api from "@/shared/api/http/client";
import { useInView } from "@/shared/hooks/useInView";
import { useTimeRange } from "@/shared/hooks/useTimeRangeQuery";
import { API_CONFIG } from "@config/apiConfig";
import { type ApiErrorShape, toApiErrorShape } from "@shared/api/utils/errorNormalization";
import {
  type DashboardDataSources,
  type DashboardPanelSpec,
  isMetricsQuerySpec,
} from "@shared/types/dashboardConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;
const STALE_MS = 30_000;

// This endpoint now returns a columnar series, but the shared dashboard
// card parser still expects flat per-bucket rows, so we flatten here.
const RED_BY_ENDPOINT_PATH = "/spans/red/red-by-endpoint";

interface EndpointRateSeriesShape {
  readonly timestamps: number[];
  readonly series: ReadonlyArray<{
    readonly httpRoute: string;
    readonly rps: ReadonlyArray<number>;
    readonly errorRate: ReadonlyArray<number | null>;
    readonly p99Ms: ReadonlyArray<number | null>;
  }>;
}

function isEndpointRateSeries(data: unknown): data is EndpointRateSeriesShape {
  if (typeof data !== "object" || data === null) return false;
  const d = data as { timestamps?: unknown; series?: unknown };
  return Array.isArray(d.timestamps) && Array.isArray(d.series);
}

function flattenEndpointRateSeries(data: unknown): unknown {
  if (!isEndpointRateSeries(data)) return data;
  const rows: Array<Record<string, unknown>> = [];
  data.timestamps.forEach((ts, i) => {
    for (const entry of data.series) {
      rows.push({
        timestamp: new Date(ts).toISOString(),
        httpRoute: entry.httpRoute,
        rps: entry.rps[i] ?? 0,
        errorRate: entry.errorRate[i] ?? null,
        p99Ms: entry.p99Ms[i] ?? null,
      });
    }
  });
  return rows;
}

interface WidgetDataResult {
  ref: ReturnType<typeof useInView<HTMLDivElement>>["ref"];
  dataSources: DashboardDataSources;
  isLoading: boolean;
  error: ApiErrorShape | null;
}

export function useWidgetData(spec: DashboardPanelSpec): WidgetDataResult {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "100px", once: true });
  const { selectedTenantId, getTimeRange } = useTimeRange();
  const { startTime, endTime } = getTimeRange();

  const endpointQuery = isMetricsQuerySpec(spec.query) ? undefined : spec.query;
  const endpoint = endpointQuery?.endpoint;
  const params = endpointQuery?.params;
  const enabled = Boolean(inView && endpoint && selectedTenantId);

  const query = useStandardQuery({
    queryKey: ["dashboard-widget", endpoint, params, startTime, endTime],
    queryFn: async () => {
      const data = await api.get<unknown>(`${V1}${endpoint}`, {
        params: { ...params, startTime, endTime },
      });
      return endpoint === RED_BY_ENDPOINT_PATH ? flattenEndpointRateSeries(data) : data;
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
