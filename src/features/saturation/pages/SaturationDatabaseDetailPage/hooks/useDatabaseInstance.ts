import { useMemo } from "react";

import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";
import { useDatastoreSystems } from "@/features/saturation/pages/SaturationDatabasePage/hooks/useDatastoreSystems";

interface DatabaseInstanceResult {
  readonly row: DatastoreSystemRow | null;
  readonly isPending: boolean;
}

                                                                          
                                                                         
export function useDatabaseInstance(system: string): DatabaseInstanceResult {
  const { data, isPending } = useDatastoreSystems();
  const row = useMemo(() => data?.find((r) => r.system === system) ?? null, [data, system]);
  return { row, isPending: isPending && data === undefined };
}
