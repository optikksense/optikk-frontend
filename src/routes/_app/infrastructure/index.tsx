import { createFileRoute } from "@tanstack/react-router";

/**
 * Infrastructure hub state: `tab` selects hosts/containers.
 * The from/to/tz params belong to the global time range (useTimeRangeURL)
 * and pass through so in-route navigations preserve them.
 */
export type InfrastructureHubSearch = {
  tab?: string;
  from?: string | number;
  to?: string | number;
  tz?: string;
};

function passthrough(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

export const Route = createFileRoute("/_app/infrastructure/")({
  validateSearch: (search: Record<string, unknown>): InfrastructureHubSearch => ({
    tab: typeof search.tab === "string" && search.tab !== "" ? search.tab : undefined,
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: typeof search.tz === "string" ? search.tz : undefined,
  }),
});
