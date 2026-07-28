import { createFileRoute, redirect } from "@tanstack/react-router";

type SettingsSearch = {
  tab?: string;
  // Global time-range params (owned by useTimeRangeURL) pass through so
  // in-route navigations preserve them.
  from?: string | number;
  to?: string | number;
  tz?: string;
};

function passthrough(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

export const Route = createFileRoute("/_app/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: typeof search.tz === "string" ? search.tz : undefined,
  }),
  beforeLoad: ({ search }) => {
    // Ingestion was promoted from a settings tab to its own page.
    if (search.tab === "ingestion") {
      throw redirect({ to: "/ingestion", replace: true });
    }
  },
});
