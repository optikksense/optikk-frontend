import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getDatastoreSummary } from "@/features/saturation/api/datastoresExplorerApi";
import type { DatastoreSummary } from "@/features/saturation/api/datastoresExplorerSchemas";

export function useDatabaseSummary() {
  return useTimeRangeQuery<DatastoreSummary>("saturation-db.summary", (_team, s, e) =>
    getDatastoreSummary(s, e)
  );
}
