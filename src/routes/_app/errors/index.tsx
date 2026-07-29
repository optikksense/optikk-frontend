import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

/**
 * Errors explorer state that must survive a page share/reload. `filters` is a
 * base64 filter snapshot; `cursor` is an opaque identifier.
 */
export type ErrorsExplorerSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/errors/")({
  validateSearch: (search: Record<string, unknown>): ErrorsExplorerSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
});
