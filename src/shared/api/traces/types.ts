/**
 * Traces explorer types — the v1 wire shape consumed by `tracesExplorerApi`
 * and the list/detail/analytics surfaces. Trace rows come from the
 * backend `traces_index` table (one row per completed trace).
 */
import type { ExplorerFilter, ExplorerIncludeFlag } from "@shared/search/types";

export interface TraceSummary {
  readonly trace_id: string;
  readonly tenant_id: number;
  readonly start_ms: number;
  readonly end_ms: number;
  readonly duration_ns: number;
  readonly root_service: string;
  readonly root_operation: string;
  readonly root_status: string;
  readonly root_http_method?: string;
  readonly root_http_status?: string;
  readonly root_endpoint?: string;
  readonly span_count: number;
  readonly has_error: boolean;
  readonly error_count: number;
  readonly environment?: string;
  readonly service_set?: readonly string[];
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
