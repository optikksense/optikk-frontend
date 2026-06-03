import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type SlowQueryPatternRow,
  getSlowQueryPatterns,
} from "@/features/saturation/api/databaseSlowQueriesApi";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";

// The backend has no per-query detail endpoint; resolve the fingerprint by
// re-fetching the patterns list and matching the hash. The preview table
// fetches the top rows by call_count, so a generous limit here always
// contains any clicked row (see the resolution invariant in the plan).
const DETAIL_LIMIT = 50;

interface DatabaseQueryDetail {
  readonly row: SlowQueryPatternRow | null;
  readonly isPending: boolean;
}

export function useDatabaseQueryDetail(queryId: string): DatabaseQueryDetail {
  const { data, isPending } = useTimeRangeQuery<SlowQueryPatternRow[]>(
    "saturation-db.query-detail",
    (_team, s, e) => getSlowQueryPatterns(s, e, undefined, DETAIL_LIMIT),
    { extraKeys: [DETAIL_LIMIT] }
  );
  const row = useMemo(
    () => data?.find((r) => queryFingerprintId(r) === queryId) ?? null,
    [data, queryId]
  );
  return { row, isPending: isPending && data === undefined };
}
