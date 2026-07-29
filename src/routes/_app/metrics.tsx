import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { asSearchString } from "@shared/search/utils/urlState";

/**
 * Explorer state that must survive a page share/reload. `queries` and
 * `formulas` are base64 state snapshots; the rest are plain enum strings.
 */
export type MetricsExplorerSearch = TimeRangeSearch & {
  queries?: string;
  formulas?: string;
  chartType?: string;
  step?: string;
  spaceAgg?: string;
};

export const Route = createFileRoute("/_app/metrics")({
  validateSearch: (search: Record<string, unknown>): MetricsExplorerSearch => ({
    ...pickTimeRangeSearch(search),
    queries: asSearchString(search.queries),
    formulas: asSearchString(search.formulas),
    chartType: asSearchString(search.chartType),
    step: asSearchString(search.step),
    spaceAgg: asSearchString(search.spaceAgg),
  }),
});
