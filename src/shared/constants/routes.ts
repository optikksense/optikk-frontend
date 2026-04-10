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
  traceDetail: "/traces/$traceId",
  traceCompare: "/traces/compare",
  metrics: "/metrics",
  infrastructure: "/infrastructure",
  errors: "/errors",
  saturation: "/saturation",
  saturationDatastoreDetail: "/saturation/datastores/$system",
  saturationKafkaTopicDetail: "/saturation/kafka/topics/$topic",
  saturationKafkaGroupDetail: "/saturation/kafka/groups/$groupId",
  aiObservability: "/ai-observability",
  aiExplorer: "/ai-explorer",
  aiSpanDetail: "/ai-explorer/$spanId",
  aiModels: "/ai-models",
  aiModelDetail: "/ai-models/$modelName",
  aiConversations: "/ai-conversations",
  aiConversationDetail: "/ai-conversations/$conversationId",
  settings: "/settings",
  alerts: "/alerts",
  alertRuleNew: "/alerts/rules/new",
  alertRuleDetail: "/alerts/rules/$ruleId",
  alertRuleEdit: "/alerts/rules/$ruleId/edit",
} as const;

/**
 *
 */
export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
