import type { ExplorerFilter } from "./filters";

export type AnalyticsVizMode = "timeseries" | "topN" | "table" | "pie" | "heatmap" | "treemap";

export type AnalyticsAggFn = "count" | "sum" | "avg" | "min" | "max" | "p50" | "p95" | "p99";

export interface AnalyticsAggregation {
  readonly fn: AnalyticsAggFn;
  readonly field?: string;
  readonly alias: string;
}

export interface AnalyticsRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly groupBy: readonly string[];
  readonly aggregations: readonly AnalyticsAggregation[];
  readonly step: string;
  readonly vizMode: AnalyticsVizMode;
  readonly limit?: number;
  readonly orderBy?: string;
}

export interface AnalyticsColumn {
  readonly name: string;
  readonly type: "string" | "number" | "time";
}

export interface AnalyticsResponse {
  readonly columns: readonly AnalyticsColumn[];
  readonly rows: ReadonlyArray<ReadonlyArray<string | number>>;
  readonly warnings?: ReadonlyArray<{ code: string; message: string }>;
}
