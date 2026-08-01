import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

type DatabaseInstanceSearch = ExplorerUrlSearch &
  TimeRangeSearch & {
    readonly tab?: "queries" | "collections";
    readonly scope?: "collection" | "query";
    readonly collection?: string;
    readonly queryHash?: string;
    readonly queries?: string;
    readonly showAll?: boolean;
  };

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export const Route = createFileRoute("/_app/database/instance/$system")({
  validateSearch: (search: Record<string, unknown>): DatabaseInstanceSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
    tab: search.tab === "queries" || search.tab === "collections" ? search.tab : undefined,
    scope: search.scope === "query" ? "query" : undefined,
    collection: optionalString(search.collection),
    queryHash:
      typeof search.queryHash === "string" && /^[0-9a-f]{16}$/.test(search.queryHash)
        ? search.queryHash
        : undefined,
    queries: optionalString(search.queries),
    showAll: search.showAll === true || search.showAll === "true" ? true : undefined,
  }),
});
