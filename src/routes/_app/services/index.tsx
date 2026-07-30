import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import {
  type ExplorerUrlSearch,
  asSearchString,
  pickExplorerSearch,
} from "@shared/search/utils/urlState";

/** Service hub state: `tab` selects catalog/map; explorer filters are URL-backed. */
export type ServiceHubSearch = TimeRangeSearch &
  ExplorerUrlSearch & {
    tab?: string;
  };

export const Route = createFileRoute("/_app/services/")({
  validateSearch: (search: Record<string, unknown>): ServiceHubSearch => ({
    ...pickTimeRangeSearch(search),
    ...pickExplorerSearch(search),
    tab: asSearchString(search.tab),
  }),
});
