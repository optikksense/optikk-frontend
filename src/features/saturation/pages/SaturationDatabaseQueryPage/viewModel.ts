import type { QueryDetailSummary } from "@/features/saturation/api/databaseQueryDetailApi";
import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";

                                                                       
                                                                               
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
    queryText: s.queryText,
    collectionName: s.collectionName,
    operationName: s.operationName || verb(s.queryText),
    topService: s.services[0]?.service ?? "",
    callCount: s.callCount,
    errorCount: s.errorCount,
    p50Ms: s.p50Ms,
    p95Ms: s.p95Ms,
    p99Ms: s.p99Ms,
    avgMs: s.avgMs,
    totalTimeMs: s.totalTimeMs,
    avgRows: s.avgRows,
  };
}

export function viewFromPatternRow(row: SlowQueryPatternRow): QueryDetailView {
  return {
    queryText: row.queryText,
    collectionName: row.collectionName,
    operationName: verb(row.queryText),
    topService: "",
    callCount: row.callCount,
    errorCount: row.errorCount,
    p50Ms: row.p50Ms,
    p95Ms: row.p95Ms,
    p99Ms: row.p99Ms,
    avgMs: null,
    totalTimeMs: null,
    avgRows: null,
  };
}
