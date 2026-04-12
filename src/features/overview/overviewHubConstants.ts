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
