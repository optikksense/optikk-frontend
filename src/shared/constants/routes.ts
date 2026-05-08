export /**
 *
 */
const ROUTES = {
  login: "/login",
  product: "/product",
  home: "/",
  features: "/features",
  architecture: "/architecture",
  pricing: "/pricing",
  opentelemetry: "/opentelemetry",
  selfHost: "/self-host",
  overview: "/overview",
  service: "/service",
  services: "/services",
  serviceMap: "/service-map",
  deployments: "/deployments",
  serviceDetail: "/services/$serviceName",
  logs: "/logs",
  traces: "/traces",
  traceDetail: "/traces/$traceId",
  traceCompare: "/traces/compare",
  metrics: "/metrics",
  infrastructure: "/infrastructure",
  hosts: "/infrastructure/hosts",
  hostDetail: "/infrastructure/hosts/$host",
  errors: "/errors",
  errorGroupDetail: "/errors/$groupId",
  slos: "/slos",
  sloDetail: "/slos/$sloId",
  saturation: "/saturation",
  saturationDatastoreDetail: "/saturation/datastores/$system",
  saturationDatabaseQueries: "/saturation/database/queries",
  saturationKafkaOverview: "/saturation/kafka",
  saturationKafkaTopicDetail: "/saturation/kafka/topics/$topic",
  saturationKafkaGroupDetail: "/saturation/kafka/groups/$groupId",

  settings: "/settings",
} as const;

/**
 *
 */
export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
