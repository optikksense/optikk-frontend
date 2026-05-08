import { useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  getP99ByQueryText,
  getSlowQueryCollections,
  getSlowQueryPatterns,
  getSlowQueryRate,
} from "../../api/databaseSlowQueriesApi";
import type {
  DatabaseFilters,
  P99ByQueryTextRow,
  SlowCollectionRow,
  SlowQueryPatternRow,
  SlowRatePoint,
} from "../../api/databaseSlowQueriesApi";

const DEFAULT_LIMIT = 25;

export interface DatabaseQueriesPageModel {
  readonly filters: DatabaseFilters;
  readonly setFilters: (next: DatabaseFilters) => void;
  readonly selectedQuery: SlowQueryPatternRow | null;
  readonly selectQuery: (q: SlowQueryPatternRow | null) => void;
  readonly patternsQuery: ReturnType<typeof useTimeRangeQuery<SlowQueryPatternRow[]>>;
  readonly collectionsQuery: ReturnType<typeof useTimeRangeQuery<SlowCollectionRow[]>>;
  readonly rateQuery: ReturnType<typeof useTimeRangeQuery<SlowRatePoint[]>>;
  readonly p99TextQuery: ReturnType<typeof useTimeRangeQuery<P99ByQueryTextRow[]>>;
}

export function useDatabaseQueriesPage(): DatabaseQueriesPageModel {
  const [filters, setFilters] = useState<DatabaseFilters>({});
  const [selectedQuery, selectQuery] = useState<SlowQueryPatternRow | null>(null);

  const filterKey = JSON.stringify(filters);

  const patternsQuery = useTimeRangeQuery<SlowQueryPatternRow[]>(
    `db-queries-patterns:${filterKey}`,
    (_, s, e) => getSlowQueryPatterns(Number(s), Number(e), filters, DEFAULT_LIMIT)
  );

  const collectionsQuery = useTimeRangeQuery<SlowCollectionRow[]>(
    `db-queries-collections:${filterKey}`,
    (_, s, e) => getSlowQueryCollections(Number(s), Number(e), filters, DEFAULT_LIMIT)
  );

  const rateQuery = useTimeRangeQuery<SlowRatePoint[]>(
    `db-queries-rate:${filterKey}`,
    (_, s, e) => getSlowQueryRate(Number(s), Number(e), filters, 1000)
  );

  const p99TextQuery = useTimeRangeQuery<P99ByQueryTextRow[]>(
    `db-queries-p99text:${filterKey}`,
    (_, s, e) => getP99ByQueryText(Number(s), Number(e), filters, 50)
  );

  return {
    filters,
    setFilters,
    selectedQuery,
    selectQuery,
    patternsQuery,
    collectionsQuery,
    rateQuery,
    p99TextQuery,
  };
}
