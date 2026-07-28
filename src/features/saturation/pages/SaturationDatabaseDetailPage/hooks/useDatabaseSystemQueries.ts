import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type SlowQueryPatternRow,
  getSlowQueryPatterns,
} from "@/features/saturation/api/databaseSlowQueriesApi";

                                                                           
                                                               
const SYSTEM_QUERY_LIMIT = 100;

interface SystemQueriesResult {
  readonly rows: SlowQueryPatternRow[];
  readonly isPending: boolean;
  readonly error: string | null;
}

export function useDatabaseSystemQueries(system: string): SystemQueriesResult {
  const { data, isPending, isError } = useTimeRangeQuery<SlowQueryPatternRow[]>(
    "saturation-db.system-queries",
    (_tenant, s, e) => getSlowQueryPatterns(s, e, { dbSystem: system }, SYSTEM_QUERY_LIMIT),
    { extraKeys: [system, SYSTEM_QUERY_LIMIT] }
  );
  return {
    rows: data ?? [],
    isPending: isPending && data === undefined,
    error: isError ? "Unable to load query patterns for the current window." : null,
  };
}
