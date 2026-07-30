import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

export type DatabaseQueriesSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/database/queries")({
  validateSearch: (search: Record<string, unknown>): DatabaseQueriesSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
});
