import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import {
  type ExplorerUrlSearch,
  asSearchString,
  pickExplorerSearch,
} from "@shared/search/utils/urlState";

export type DeploymentsSearch = TimeRangeSearch &
  ExplorerUrlSearch & {
    tab?: string;
    sort?: string;
  };

export const Route = createFileRoute("/_app/deployments/")({
  validateSearch: (search: Record<string, unknown>): DeploymentsSearch => ({
    ...pickTimeRangeSearch(search),
    ...pickExplorerSearch(search),
    tab: asSearchString(search.tab),
    sort: asSearchString(search.sort),
  }),
});
