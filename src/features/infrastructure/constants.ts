export const INFRA_DOMAIN_KEY = "infrastructure" as const;

export const INFRA_TAB = {
  fleet: "fleet",
  resources: "resources",
  kubernetes: "kubernetes",
  jvm: "jvm",
  nodes: "nodes",
} as const;

export type InfraTabId = (typeof INFRA_TAB)[keyof typeof INFRA_TAB];

export const INFRA_LENS = {
  host: "host",
  pod: "pod",
} as const;

export type InfraLensId = (typeof INFRA_LENS)[keyof typeof INFRA_LENS];

export const INFRA_FILL = {
  error_rate: "error_rate",
  avg_latency_ms: "avg_latency_ms",
  pod_count: "pod_count",
  request_count: "request_count",
} as const;

export type InfraFillMetric = (typeof INFRA_FILL)[keyof typeof INFRA_FILL];

export const INFRA_SIZE = {
  request_count: "request_count",
  pod_count: "pod_count",
  uniform: "uniform",
} as const;

export type InfraSizeMetric = (typeof INFRA_SIZE)[keyof typeof INFRA_SIZE];

export const INFRA_GROUP = {
  none: "none",
  health: "health",
  host_prefix: "host_prefix",
} as const;

export type InfraGroupMode = (typeof INFRA_GROUP)[keyof typeof INFRA_GROUP];

export const URL_TAB = "tab";
export const URL_LENS = "infraLens";
export const URL_FILL = "infraFill";
export const URL_SIZE = "infraSize";
export const URL_GROUP = "infraGroup";
export const URL_FILTER = "infraFilter";
