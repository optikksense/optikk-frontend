import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { tsMs } from "@shared/utils/chartDataUtils";

import { type EndpointRatePoint, getREDByEndpoint } from "@shared/api/red/redApi";

// Palette for per-route lines, cycled by route order.
const ROUTE_COLORS = [
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

export function pivotByRoute(
  rows: EndpointRatePoint[],
  pick: (row: EndpointRatePoint) => number | null,
  fill: boolean
): PivotedSeries {
  const tsSet = new Set<number>();
  const routeSet = new Set<string>();
  const routes: string[] = [];

  for (const row of rows) {
    tsSet.add(tsMs(row.timestamp) / 1000);
    if (!routeSet.has(row.httpRoute)) {
      routeSet.add(row.httpRoute);
      routes.push(row.httpRoute);
    }
  }

  const timestamps = [...tsSet].sort((a, b) => a - b);
  const tsIndex = new Map(timestamps.map((t, i) => [t, i]));

  const byRoute = new Map<string, Array<number | null>>();
  for (const route of routes) {
    byRoute.set(route, new Array(timestamps.length).fill(null));
  }

  for (const row of rows) {
    const idx = tsIndex.get(tsMs(row.timestamp) / 1000);
    if (idx === undefined) continue;
    const target = byRoute.get(row.httpRoute);
    if (target) target[idx] = pick(row);
  }

  const series: ObservabilityChartSeries[] = routes.map((route, i) => ({
    label: route || "unknown",
    values: byRoute.get(route) ?? [],
    color: ROUTE_COLORS[i % ROUTE_COLORS.length] ?? "var(--chart-1)",
    fill,
  }));

  return { timestamps, series };
}

export function useREDByEndpoint(serviceName: string) {
  return useTimeRangeQuery<EndpointRatePoint[]>(
    "service-detail.red-by-endpoint",
    (_tenant, start, end) => getREDByEndpoint(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
