import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type SlowQueryPatternRow,
  getSlowQueryPatterns,
} from "@/features/saturation/api/databaseSlowQueriesApi";

// Top normalized query fingerprints for one datastore instance. Backs both
// the Queries tab and the (client-aggregated) Collections tab.
const SYSTEM_QUERY_LIMIT = 100;

interface SystemQueriesResult {
  readonly rows: SlowQueryPatternRow[];
  readonly isPending: boolean;
}

export function useDatabaseSystemQueries(system: string): SystemQueriesResult {
  const { data, isPending } = useTimeRangeQuery<SlowQueryPatternRow[]>(
    "saturation-db.system-queries",
    (_tenant, s, e) => getSlowQueryPatterns(s, e, { db_system: system }, SYSTEM_QUERY_LIMIT),
    { extraKeys: [system, SYSTEM_QUERY_LIMIT] }
  );
  return { rows: data ?? [], isPending: isPending && data === undefined };
}
