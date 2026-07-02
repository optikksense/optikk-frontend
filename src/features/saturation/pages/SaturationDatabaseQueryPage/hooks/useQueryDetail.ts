import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type QueryDetailSummary,
  type QueryExecutionRow,
  type QueryTimeseriesPoint,
  getQueryDetailExecutions,
  getQueryDetailSummary,
  getQueryDetailTimeseries,
} from "@/features/saturation/api/databaseQueryDetailApi";

// Backend query_hash is hex(UInt64): exactly 16 lowercase hex chars.
// Legacy client-side djb2 ids are base36 and shorter, so this is unambiguous.
export function isBackendQueryHash(queryId: string): boolean {
  return /^[0-9a-f]{16}$/.test(queryId);
}

export function useQueryDetailSummary(hash: string, enabled: boolean) {
  return useTimeRangeQuery<QueryDetailSummary | null>(
    "saturation-db.query-summary",
    (_team, s, e) => getQueryDetailSummary(hash, s, e),
    { extraKeys: [hash], enabled }
  );
}

export function useQueryDetailTimeseries(hash: string, enabled: boolean) {
  return useTimeRangeQuery<QueryTimeseriesPoint[]>(
    "saturation-db.query-timeseries",
    (_team, s, e) => getQueryDetailTimeseries(hash, s, e),
    { extraKeys: [hash], enabled }
  );
}

export function useQueryDetailExecutions(hash: string, enabled: boolean) {
  return useTimeRangeQuery<QueryExecutionRow[]>(
    "saturation-db.query-executions",
    (_team, s, e) => getQueryDetailExecutions(hash, s, e),
    { extraKeys: [hash], enabled }
  );
}
