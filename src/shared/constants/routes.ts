export /**
 *
 */
const ROUTES = {
  login: "/login",
  product: "/product",
  home: "/",
  pricing: "/pricing",
  opentelemetry: "/opentelemetry",
  selfHost: "/self-host",
  overview: "/overview",
  service: "/service",
  logs: "/logs",
  traces: "/traces",
  traceDetail: "/traces/:traceId",
  traceCompare: "/traces/compare",
  metrics: "/metrics",
  infrastructure: "/infrastructure",
  errors: "/errors",
  saturation: "/saturation",
  aiObservability: "/ai-observability",
  aiRuns: "/ai-runs",
  aiRunDetail: "/ai-runs/:spanId",
  aiTraceDetail: "/ai-traces/:traceId",
  aiConversations: "/ai-conversations",
  aiConversationDetail: "/ai-conversations/:conversationId",
  settings: "/settings",
} as const;

/**
 *
 */
export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
