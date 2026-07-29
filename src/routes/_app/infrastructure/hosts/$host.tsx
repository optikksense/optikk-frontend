import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

/** The explorer params back the host's embedded logs panel (useExplorerState). */
export type HostDetailSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/infrastructure/hosts/$host")({
  validateSearch: (search: Record<string, unknown>): HostDetailSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
});
