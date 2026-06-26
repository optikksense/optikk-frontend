import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";

/**
 * Stable short id for a normalized slow-query row. The backend has no
 * per-query detail endpoint and no query id, so the Database hub and the
 * Query detail page key drill-in by a deterministic hash of the query text +
 * collection. Same fingerprint always yields the same id, so links survive
 * refresh and resolve against a re-fetched patterns list.
 */
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

export function queryFingerprintId(
  row: Pick<SlowQueryPatternRow, "query_text" | "collection_name">
): string {
  return djb2(`${row.query_text}::${row.collection_name}`).toString(36);
}
