import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

/** The explorer params back the container's embedded logs panel (useExplorerState). */
export type ContainerDetailSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/infrastructure/containers/$container")({
  validateSearch: (search: Record<string, unknown>): ContainerDetailSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
});
