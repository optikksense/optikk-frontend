export const OVERVIEW_HUB_TAB = {
  summary: "summary",
  latencyAnalysis: "latency-analysis",
  apm: "apm",
  errors: "errors",
  http: "http",
  slo: "slo",
} as const;

export type OverviewHubTabId = (typeof OVERVIEW_HUB_TAB)[keyof typeof OVERVIEW_HUB_TAB];

export const OVERVIEW_URL_TAB = "tab";

/**
 * staleTime for Overview Hub queries. Overview data is rarely worth refetching
 * on every tab switch; a 5-minute window lets users navigate without triggering
 * repeat network. `triggerRefresh()` still forces invalidation for explicit refresh.
 */
export const OVERVIEW_QUERY_STALE_MS = 5 * 60_000;
