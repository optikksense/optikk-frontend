import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type QueryDetailSummary,
  type QueryExecutionRow,
  type QueryTimeseriesPoint,
  getQueryDetailExecutions,
  getQueryDetailSummary,
  getQueryDetailTimeseries,
} from "@/features/saturation/api/databaseQueryDetailApi";
import type { DatabaseFilters } from "@/features/saturation/api/databaseSlowQueriesApi";

                                                                    
                                                                              
export function isBackendQueryHash(queryId: string): boolean {
  return /^[0-9a-f]{16}$/.test(queryId);
}

function scopeKeys(hash: string, filters: DatabaseFilters) {
  return [hash, filters.dbSystem, filters.collection, filters.namespace, filters.server];
}

export function useQueryDetailSummary(hash: string, filters: DatabaseFilters, enabled: boolean) {
  return useTimeRangeQuery<QueryDetailSummary | null>(
    "saturation-db.query-summary",
    (_tenant, s, e) => getQueryDetailSummary(hash, s, e, filters),
    { extraKeys: scopeKeys(hash, filters), enabled }
  );
}

export function useQueryDetailTimeseries(hash: string, filters: DatabaseFilters, enabled: boolean) {
  return useTimeRangeQuery<QueryTimeseriesPoint[]>(
    "saturation-db.query-timeseries",
    (_tenant, s, e) => getQueryDetailTimeseries(hash, s, e, filters),
    { extraKeys: scopeKeys(hash, filters), enabled }
  );
}

export function useQueryDetailExecutions(hash: string, filters: DatabaseFilters, enabled: boolean) {
  return useTimeRangeQuery<QueryExecutionRow[]>(
    "saturation-db.query-executions",
    (_tenant, s, e) => getQueryDetailExecutions(hash, s, e, filters),
    { extraKeys: scopeKeys(hash, filters), enabled }
  );
}
