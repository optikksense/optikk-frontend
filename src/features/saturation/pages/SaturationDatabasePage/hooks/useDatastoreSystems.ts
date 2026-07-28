import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getDatastoreSystems } from "@/features/saturation/api/datastoresExplorerApi";
import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";

// Fleet of monitored datastore instances for the list screen.
export function useDatastoreSystems() {
  return useTimeRangeQuery<DatastoreSystemRow[]>("saturation-db.systems", (_tenant, s, e) =>
    getDatastoreSystems(s, e)
  );
}
