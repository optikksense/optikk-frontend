import { createFileRoute } from "@tanstack/react-router";

/**
 * Service hub state: `tab` selects catalog/map, `status` filters the catalog.
 * The from/to/tz params belong to the global time range (useTimeRangeURL)
 * and pass through so in-route navigations preserve them.
 */
export type ServiceHubSearch = {
  tab?: string;
  status?: string;
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

export const Route = createFileRoute("/_app/services/")({
  validateSearch: (search: Record<string, unknown>): ServiceHubSearch => ({
    tab: asString(search.tab),
    status: asString(search.status),
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: typeof search.tz === "string" ? search.tz : undefined,
  }),
});
