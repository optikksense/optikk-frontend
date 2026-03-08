export /**
 *
 */
const ROUTES = {
  login: '/login',
  product: '/product',
  home: '/',
  overview: '/overview',
  logs: '/logs',
  traces: '/traces',
  traceDetail: '/traces/:traceId',
  services: '/services',
  serviceDetail: '/services/:serviceName',
  metrics: '/metrics',
  infrastructure: '/infrastructure',
  errors: '/errors',
  saturation: '/saturation',
  aiObservability: '/ai-observability',
  settings: '/settings',
  latencyAlias: '/latency',
} as const;

/**
 *
 */
export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
