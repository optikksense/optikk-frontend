import type { ExplorerFilter } from "./filters";

export type ExplorerIncludeFlag = "facets" | "trend" | "summary";

export interface ExplorerQueryRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly cursor?: string;
  readonly limit: number;
  readonly include?: readonly ExplorerIncludeFlag[];
}

export interface ExplorerFacetBucket {
  readonly value: string;
  readonly count: number;
}

/** Mirrors Go explorer.TrendBucket — traces are only ever OK or errored. */
export interface ExplorerTrendBucket {
  readonly timeBucket: string;
  readonly total: number;
  readonly errors: number;
}

export interface ExplorerQueryWarnings {
  readonly code: string;
  readonly message: string;
}

export interface ExplorerSummary {
  readonly total: number;
  readonly errors: number;
}
