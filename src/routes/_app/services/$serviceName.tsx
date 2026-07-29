import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import {
  type ExplorerUrlSearch,
  asSearchString,
  pickExplorerSearch,
} from "@shared/search/utils/urlState";

/**
 * Service detail state: `tab` selects the detail tab; the explorer params
 * back the embedded logs/traces tab panels (useExplorerState).
 */
export type ServiceDetailSearch = ExplorerUrlSearch & TimeRangeSearch & { tab?: string };

export const Route = createFileRoute("/_app/services/$serviceName")({
  validateSearch: (search: Record<string, unknown>): ServiceDetailSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
    tab: asSearchString(search.tab),
  }),
});
