/**
 * Traces explorer types — the v1 wire shape consumed by `tracesExplorerApi`
 * and the list/detail/analytics surfaces. Trace rows come from the
 * backend `traces_index` table (one row per completed trace).
 */
import type { ExplorerFilter } from "@shared/search/types/filters";
import type { ExplorerIncludeFlag } from "@shared/search/types/queries";

export interface TraceSummary {
  readonly traceId: string;
  readonly tenantId: number;
  readonly startMs: number;
  readonly endMs: number;
  readonly durationNs: number;
  readonly rootService: string;
  readonly rootOperation: string;
  readonly rootStatus: string;
  readonly rootHttpMethod?: string;
  readonly rootHttpStatus?: string;
  readonly rootEndpoint?: string;
  readonly spanCount: number;
  readonly hasError: boolean;
  readonly errorCount: number;
  readonly environment?: string;
  readonly serviceSet?: readonly string[];
  readonly truncated?: boolean;
}

export interface TracesQueryRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly cursor?: string;
  readonly limit: number;
  readonly include?: readonly ExplorerIncludeFlag[];
}

export interface TracesFacetBucket {
  readonly value: string;
  readonly count: number;
}

/** POST /traces/facets, keyed by facet dimension. */
export type TracesFacets = Readonly<Record<string, readonly TracesFacetBucket[]>>;

/**
 * POST /traces/query. Mirrors Go explorer.QueryResponse, which carries only
 * results + pageInfo. Facets and trend are separate endpoints, and `summary`
 * is derived client-side from the trend buckets — see useTracesExplorer.
 */
export interface TracesQueryResponse {
  readonly traces: readonly TraceSummary[];
  readonly nextCursor?: string;
}
