import { CHART_COLORS } from "@config/constants";
import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";

import type {
  QueryPerformanceResponse,
  QueryPerformanceSeries,
} from "@/features/saturation/api/databaseQueryPerformanceApi";

export function queryDisplayLabel(query: { queryHash: string; queryLabel: string }): string {
  const label = query.queryLabel.trim() || "Database query";
  return `${label} · ${query.queryHash.slice(0, 8)}`;
}

function colorForQuery(queryHash: string): string {
  const hashValue = Number.parseInt(queryHash.slice(-8), 16);
  return CHART_COLORS[hashValue % CHART_COLORS.length];
}

function visibleSeries(
  response: QueryPerformanceResponse,
  visibleHashes: ReadonlySet<string>
): QueryPerformanceSeries[] {
  if (visibleHashes.size === 0) return response.series;
  return response.series.filter((series) => visibleHashes.has(series.queryHash));
}

function timestampsFor(series: QueryPerformanceSeries[]): number[] {
  const timestamps = new Set<number>();
  for (const query of series) {
    for (const point of query.points) timestamps.add(Math.floor(point.timeBucketMs / 1000));
  }
  return Array.from(timestamps).sort((a, b) => a - b);
}

function valuesAt(
  query: QueryPerformanceSeries,
  timestamps: number[],
  value: (point: QueryPerformanceSeries["points"][number]) => number
): Array<number | null> {
  const byTimestamp = new Map(
    query.points.map((point) => [Math.floor(point.timeBucketMs / 1000), value(point)])
  );
  return timestamps.map((timestamp) => byTimestamp.get(timestamp) ?? null);
}

export interface QueryPerformanceChartModel {
  readonly timestamps: number[];
  readonly latency: ObservabilityChartSeries[];
  readonly throughput: ObservabilityChartSeries[];
}

export function buildQueryPerformanceCharts(
  response: QueryPerformanceResponse,
  mode: "collection" | "query",
  visibleHashes: ReadonlySet<string>
): QueryPerformanceChartModel {
  const queries = visibleSeries(response, visibleHashes);
  const timestamps = timestampsFor(queries);
  const throughput = queries.map((query) => ({
    label: queryDisplayLabel(query),
    values: valuesAt(query, timestamps, (point) => point.opsPerSec),
    color: colorForQuery(query.queryHash),
  }));
  if (mode === "query") {
    const query = queries[0];
    return {
      timestamps,
      throughput,
      latency: query
        ? [
            {
              label: "p50",
              values: valuesAt(query, timestamps, (point) => point.p50Ms),
              color: "var(--color-info,#3b82f6)",
            },
            {
              label: "p95",
              values: valuesAt(query, timestamps, (point) => point.p95Ms),
              color: "var(--color-warning,#f59e0b)",
            },
            {
              label: "p99",
              values: valuesAt(query, timestamps, (point) => point.p99Ms),
              color: "var(--color-error,#ef4444)",
            },
          ]
        : [],
    };
  }
  return {
    timestamps,
    throughput,
    latency: queries.flatMap((query) => {
      const color = colorForQuery(query.queryHash);
      const label = queryDisplayLabel(query);
      return [
        {
          label: `${label} p95`,
          values: valuesAt(query, timestamps, (point) => point.p95Ms),
          color,
          dash: [6, 4],
        },
        {
          label: `${label} p99`,
          values: valuesAt(query, timestamps, (point) => point.p99Ms),
          color,
        },
      ];
    }),
  };
}
