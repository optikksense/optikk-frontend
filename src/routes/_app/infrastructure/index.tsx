import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import {
  type ExplorerUrlSearch,
  asSearchString,
  pickExplorerSearch,
} from "@shared/search/utils/urlState";

/** Infrastructure hub state: `tab` selects hosts/containers. */
export type InfrastructureHubSearch = TimeRangeSearch & ExplorerUrlSearch & { tab?: string };

export const Route = createFileRoute("/_app/infrastructure/")({
  validateSearch: (search: Record<string, unknown>): InfrastructureHubSearch => ({
    ...pickTimeRangeSearch(search),
    ...pickExplorerSearch(search),
    tab: asSearchString(search.tab),
  }),
});
