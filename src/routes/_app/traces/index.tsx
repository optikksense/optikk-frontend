import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

/**
 * Traces explorer state that must survive a page share/reload. `filters` is a
 * base64 filter snapshot; `cursor`/`detail` are opaque identifiers.
 */
export type TracesExplorerSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/traces/")({
  validateSearch: (search: Record<string, unknown>): TracesExplorerSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
});
