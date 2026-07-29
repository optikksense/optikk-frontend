import { useMemo } from "react";

import { ErrorsExplorerContent } from "@shared/errors/components/ErrorsExplorerContent";
import { useErrorsExplorer } from "@shared/errors/hooks/useErrorsExplorer";
import type { ExplorerFilter } from "@shared/search/types/filters";

/**
 * Service-scoped Errors tab: the same Error Tracking body (KPI strip +
 * volume chart + issues table) as the standalone page, locked to this
 * service. The facet rail and search bar are page chrome and stay out.
 */
export function ErrorsTabPanel({ serviceName }: { serviceName: string }) {
  const baseFilters = useMemo<readonly ExplorerFilter[]>(
    () => [{ field: "service", op: "eq", value: serviceName }],
    [serviceName]
  );
  const model = useErrorsExplorer({ baseFilters, includeFacets: false });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ErrorsExplorerContent model={model} />
    </div>
  );
}
