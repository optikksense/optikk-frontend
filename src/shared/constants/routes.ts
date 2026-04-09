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
  aiRuns: "/ai-runs",
  aiRunDetail: "/ai-runs/$spanId",
  aiTraceDetail: "/ai-traces/$traceId",
  aiConversations: "/ai-conversations",
  aiConversationDetail: "/ai-conversations/$conversationId",
  aiPrompts: "/ai-prompts",
  aiPromptDetail: "/ai-prompts/$promptId",
  aiDatasets: "/ai-datasets",
  aiDatasetDetail: "/ai-datasets/$datasetId",
  aiEvals: "/ai-evals",
  aiEvalDetail: "/ai-evals/$evalId",
  aiExperiments: "/ai-experiments",
  aiExperimentDetail: "/ai-experiments/$experimentId",
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
