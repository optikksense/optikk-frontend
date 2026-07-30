import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

type DatabaseInstanceSearch = ExplorerUrlSearch &
  TimeRangeSearch & {
    readonly tab?: "queries" | "collections";
  };

export const Route = createFileRoute("/_app/database/instance/$system")({
  validateSearch: (search: Record<string, unknown>): DatabaseInstanceSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
    tab: search.tab === "queries" || search.tab === "collections" ? search.tab : undefined,
  }),
});
