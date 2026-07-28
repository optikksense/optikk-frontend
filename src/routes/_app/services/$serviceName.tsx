import { createFileRoute } from "@tanstack/react-router";

import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

/**
 * Service detail state: `tab` selects the detail tab; the explorer params
 * back the embedded logs/traces tab panels (useExplorerState).
 * The from/to/tz params belong to the global time range (useTimeRangeURL)
 * and pass through so in-route navigations preserve them.
 */
export type ServiceDetailSearch = ExplorerUrlSearch & {
  tab?: string;
  from?: string | number;
  to?: string | number;
  tz?: string;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function passthrough(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

export const Route = createFileRoute("/_app/services/$serviceName")({
  validateSearch: (search: Record<string, unknown>): ServiceDetailSearch => ({
    ...pickExplorerSearch(search),
    tab: asString(search.tab),
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: typeof search.tz === "string" ? search.tz : undefined,
  }),
});
