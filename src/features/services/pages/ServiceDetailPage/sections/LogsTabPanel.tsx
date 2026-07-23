import { useMemo } from "react";

import { LogsExplorerContent } from "@shared/logs/components/LogsExplorerContent";
import { LogDetailDrawer } from "@shared/logs/components/detail/LogDetailDrawer";
import { useLogsExplorer } from "@shared/logs/hooks/useLogsExplorer";
import type { ExplorerFilter } from "@shared/search/types/filters";

/**
 * Service-scoped Logs tab: the same explorer content (stat pills + trend chart +
 * table + detail drawer) as the standalone page, locked to this service.
 */
export function LogsTabPanel({ serviceName }: { serviceName: string }) {
  const baseFilters = useMemo<readonly ExplorerFilter[]>(
    () => [{ field: "serviceName", op: "eq", value: serviceName }],
    [serviceName]
  );

  const explorer = useLogsExplorer({ baseFilters, includeFacets: false });
  const { state } = explorer;

  const results = explorer.list.results;
  const detailIdx = state.detail ? results.findIndex((r) => r.id === state.detail) : -1;
  const onDetailPrev = detailIdx > 0 ? () => state.setDetail(results[detailIdx - 1].id) : undefined;
  const onDetailNext =
    detailIdx >= 0 && detailIdx < results.length - 1
      ? () => state.setDetail(results[detailIdx + 1].id)
      : undefined;

  return (
    <div className="flex min-w-0 flex-col">
      <LogsExplorerContent explorer={explorer} />

      <LogDetailDrawer
        logId={state.detail ?? ""}
        open={Boolean(state.detail)}
        onClose={() => state.setDetail(null)}
        onPrev={onDetailPrev}
        onNext={onDetailNext}
      />
    </div>
  );
}
