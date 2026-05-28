import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getDatastoreSystems } from "@/features/saturation/api/datastoresExplorerApi";
import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";

export function useDatabaseSystems() {
  return useTimeRangeQuery<DatastoreSystemRow[]>("saturation-db.systems", (_team, s, e) =>
    getDatastoreSystems(s, e)
  );
}
