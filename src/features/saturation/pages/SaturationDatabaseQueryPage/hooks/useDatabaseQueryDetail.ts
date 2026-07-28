import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type SlowQueryPatternRow,
  getSlowQueryPatterns,
} from "@/features/saturation/api/databaseSlowQueriesApi";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";

                                                                           
                                                                         
                                                                     
                                                                       
const DETAIL_LIMIT = 50;

interface DatabaseQueryDetail {
  readonly row: SlowQueryPatternRow | null;
  readonly isPending: boolean;
}

export function useDatabaseQueryDetail(queryId: string): DatabaseQueryDetail {
  const { data, isPending } = useTimeRangeQuery<SlowQueryPatternRow[]>(
    "saturation-db.query-detail",
    (_tenant, s, e) => getSlowQueryPatterns(s, e, undefined, DETAIL_LIMIT),
    { extraKeys: [DETAIL_LIMIT] }
  );
  const row = useMemo(
    () => data?.find((r) => queryFingerprintId(r) === queryId) ?? null,
    [data, queryId]
  );
  return { row, isPending: isPending && data === undefined };
}
