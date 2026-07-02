import type { QueryDetailSummary } from "@/features/saturation/api/databaseQueryDetailApi";
import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";

// Common shape the header and KPI strip render, filled either from the
// query-detail summary endpoint or (legacy fallback) a slow-query pattern row.
export interface QueryDetailView {
  readonly queryText: string;
  readonly collectionName: string;
  readonly operationName: string;
  readonly topService: string;
  readonly callCount: number;
  readonly errorCount: number;
  readonly p50Ms: number | null;
  readonly p95Ms: number | null;
  readonly p99Ms: number | null;
  readonly avgMs: number | null;
  readonly totalTimeMs: number | null;
  readonly avgRows: number | null;
}

function verb(queryText: string): string {
  const first = queryText.trim().split(/\s+/, 1)[0] ?? "";
  return first.toUpperCase();
}

export function viewFromSummary(s: QueryDetailSummary): QueryDetailView {
  return {
    queryText: s.query_text,
    collectionName: s.collection_name,
    operationName: s.operation_name || verb(s.query_text),
    topService: s.services[0]?.service ?? "",
    callCount: s.call_count,
    errorCount: s.error_count,
    p50Ms: s.p50_ms,
    p95Ms: s.p95_ms,
    p99Ms: s.p99_ms,
    avgMs: s.avg_ms,
    totalTimeMs: s.total_time_ms,
    avgRows: s.avg_rows,
  };
}

export function viewFromPatternRow(row: SlowQueryPatternRow): QueryDetailView {
  return {
    queryText: row.query_text,
    collectionName: row.collection_name,
    operationName: verb(row.query_text),
    topService: "",
    callCount: row.call_count,
    errorCount: row.error_count,
    p50Ms: row.p50_ms,
    p95Ms: row.p95_ms,
    p99Ms: row.p99_ms,
    avgMs: null,
    totalTimeMs: null,
    avgRows: null,
  };
}
