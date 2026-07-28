import { createFileRoute } from "@tanstack/react-router";

/**
 * Explorer state that must survive a page share/reload. `queries` and
 * `formulas` are base64 state snapshots; the rest are plain enum strings.
 * The from/to/tz params belong to the global time range (useTimeRangeURL)
 * and pass through so in-route navigations preserve them.
 */
export type MetricsExplorerSearch = {
  queries?: string;
  formulas?: string;
  chartType?: string;
  step?: string;
  spaceAgg?: string;
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

export const Route = createFileRoute("/_app/metrics")({
  validateSearch: (search: Record<string, unknown>): MetricsExplorerSearch => ({
    queries: asString(search.queries),
    formulas: asString(search.formulas),
    chartType: asString(search.chartType),
    step: asString(search.step),
    spaceAgg: asString(search.spaceAgg),
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: asString(search.tz),
  }),
});
