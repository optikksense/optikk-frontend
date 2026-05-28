import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type SlowQueryPatternRow,
  getSlowQueryPatterns,
} from "@/features/saturation/api/databaseSlowQueriesApi";

export function useDatabaseSlowQueriesPreview(limit = 8) {
  return useTimeRangeQuery<SlowQueryPatternRow[]>(
    "saturation-db.slow-queries-preview",
    (_team, s, e) => getSlowQueryPatterns(s, e, undefined, limit),
    { extraKeys: [limit] }
  );
}
