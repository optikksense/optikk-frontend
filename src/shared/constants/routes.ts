export /**
 *
 */
const ROUTES = {
  login: '/login',
  product: '/product',
  home: '/',
  pricing: '/pricing',
  opentelemetry: '/opentelemetry',
  selfHost: '/self-host',
  overview: '/overview',
  logs: '/logs',
  logsPatterns: '/logs/patterns',
  logsTransactions: '/logs/transactions',
  traces: '/traces',
  traceDetail: '/traces/:traceId',
  traceCompare: '/traces/compare',
metrics: '/metrics',
  infrastructure: '/infrastructure',
  errors: '/errors',
  saturation: '/saturation',
  kafkaTopicDetail: '/saturation/kafka/topics/:topic',
  kafkaGroupDetail: '/saturation/kafka/groups/:groupId',
  aiObservability: '/ai-observability',
  aiRuns: '/ai-runs',
  aiRunDetail: '/ai-runs/:spanId',
  aiTraceDetail: '/ai-traces/:traceId',
  aiConversations: '/ai-conversations',
  aiConversationDetail: '/ai-conversations/:conversationId',
  settings: '/settings',
} as const;

/**
 *
 */
export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
