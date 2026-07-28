import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type EndpointRateEntry,
  type EndpointRateSeries,
  getREDByEndpoint,
} from "@shared/api/red/redApi";

const ENDPOINT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export interface PivotedSeries {
  readonly timestamps: number[];
  readonly series: ObservabilityChartSeries[];
}

export function pivotByEndpoint(
  data: EndpointRateSeries | undefined,
  pick: (entry: EndpointRateEntry) => ReadonlyArray<number | null>,
  fill: boolean
): PivotedSeries {
  if (!data) return { timestamps: [], series: [] };

  // ObservabilityChart expects unix seconds; the API emits unix millis.
  const timestamps = data.timestamps.map((t) => t / 1000);

  const series: ObservabilityChartSeries[] = data.series.map((entry, i) => ({
    label: entry.operationName,
    values: [...pick(entry)],
    color: ENDPOINT_COLORS[i % ENDPOINT_COLORS.length] ?? "var(--chart-1)",
    fill,
  }));

  return { timestamps, series };
}

export function useREDByEndpoint(serviceName: string) {
  return useTimeRangeQuery<EndpointRateSeries>(
    "service-detail.red-by-endpoint",
    (_tenant, start, end) => getREDByEndpoint(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
