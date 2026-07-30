import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

export type DatabaseExplorerSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/database/")({
  validateSearch: (search: Record<string, unknown>): DatabaseExplorerSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
});
