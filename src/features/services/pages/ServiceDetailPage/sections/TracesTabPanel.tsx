import { useMemo } from "react";

import type { ExplorerFilter } from "@shared/search/types/filters";
import { TracesExplorerContent } from "@shared/traces/components/TracesExplorerContent";
import { useTracesExplorerModel } from "@shared/traces/hooks/useTracesExplorerModel";

/**
 * Service-scoped Traces tab: the same explorer content (stat pills + trace-volume
 * chart + table) as the standalone page, locked to this service.
 */
export function TracesTabPanel({ serviceName }: { serviceName: string }) {
  const baseFilters = useMemo<readonly ExplorerFilter[]>(
    () => [{ field: "serviceName", op: "eq", value: serviceName }],
    [serviceName]
  );

  const model = useTracesExplorerModel({ baseFilters, includeFacets: false });

  return (
    <div className="flex min-w-0 flex-col">
      <TracesExplorerContent model={model} />
    </div>
  );
}
