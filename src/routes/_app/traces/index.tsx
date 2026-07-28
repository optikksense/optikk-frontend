import { createFileRoute } from "@tanstack/react-router";

import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

/**
 * Traces explorer state that must survive a page share/reload. `filters` is a
 * base64 filter snapshot; `cursor`/`detail` are opaque identifiers.
 * The from/to/tz params belong to the global time range (useTimeRangeURL)
 * and pass through so in-route navigations preserve them.
 */
export type TracesExplorerSearch = ExplorerUrlSearch & {
  from?: string | number;
  to?: string | number;
  tz?: string;
};

function passthrough(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

export const Route = createFileRoute("/_app/traces/")({
  validateSearch: (search: Record<string, unknown>): TracesExplorerSearch => ({
    ...pickExplorerSearch(search),
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: typeof search.tz === "string" ? search.tz : undefined,
  }),
});
