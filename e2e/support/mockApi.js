function json(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const team = {
  id: 101,
  name: 'Platform Core',
  orgName: 'Acme Cloud',
};

const services = [
  {
    service_name: 'checkout',
    request_count: 6500,
    error_count: 52,
    avg_latency: 120,
    p95_latency: 260,
    p99_latency: 410,
  },
  {
    service_name: 'payments',
    request_count: 3200,
    error_count: 74,
    avg_latency: 185,
    p95_latency: 420,
    p99_latency: 620,
  },
  {
    service_name: 'inventory',
    request_count: 2800,
    error_count: 9,
    avg_latency: 72,
    p95_latency: 140,
    p99_latency: 210,
  },
];

const endpointMetrics = [
  {
    service_name: 'checkout',
    operation_name: 'POST /api/checkout',
    http_method: 'POST',
    request_count: 4200,
    error_count: 44,
    avg_latency: 132,
    p95_latency: 280,
    p99_latency: 430,
  },
  {
    service_name: 'payments',
    operation_name: 'POST /api/payments',
    http_method: 'POST',
    request_count: 2200,
    error_count: 31,
    avg_latency: 205,
    p95_latency: 460,
    p99_latency: 690,
  },
];

const requestTimeseries = [
  { timestamp: minutesAgo(25), request_count: 1500, error_count: 18, avg_latency: 110, p95: 240, p99: 360 },
  { timestamp: minutesAgo(20), request_count: 1650, error_count: 21, avg_latency: 115, p95: 250, p99: 380 },
  { timestamp: minutesAgo(15), request_count: 1800, error_count: 26, avg_latency: 123, p95: 275, p99: 410 },
  { timestamp: minutesAgo(10), request_count: 2050, error_count: 32, avg_latency: 131, p95: 295, p99: 430 },
  { timestamp: minutesAgo(5), request_count: 2280, error_count: 38, avg_latency: 138, p95: 315, p99: 455 },
];

const serviceTimeseries = [
  { timestamp: minutesAgo(25), service_name: 'checkout', request_count: 900, error_count: 6, avg_latency: 112 },
  { timestamp: minutesAgo(20), service_name: 'checkout', request_count: 980, error_count: 7, avg_latency: 118 },
  { timestamp: minutesAgo(15), service_name: 'checkout', request_count: 1020, error_count: 8, avg_latency: 121 },
  { timestamp: minutesAgo(10), service_name: 'payments', request_count: 680, error_count: 13, avg_latency: 178 },
  { timestamp: minutesAgo(5), service_name: 'inventory', request_count: 540, error_count: 2, avg_latency: 71 },
];

const logs = [
  {
    id: '9001',
    timestamp: minutesAgo(4),
    level: 'ERROR',
    service_name: 'payments',
    serviceName: 'payments',
    message: 'payment timeout while charging card',
    host: 'node-a',
    logger: 'PaymentController',
    trace_id: 'trace-payments-1',
    traceId: 'trace-payments-1',
  },
  {
    id: '9002',
    timestamp: minutesAgo(3),
    level: 'WARN',
    service_name: 'checkout',
    serviceName: 'checkout',
    message: 'retrying upstream inventory call',
    host: 'node-b',
    logger: 'CheckoutFlow',
    trace_id: 'trace-checkout-1',
    traceId: 'trace-checkout-1',
  },
  {
    id: '9003',
    timestamp: minutesAgo(2),
    level: 'INFO',
    service_name: 'inventory',
    serviceName: 'inventory',
    message: 'inventory cache refresh complete',
    host: 'node-c',
    logger: 'InventoryCache',
    trace_id: 'trace-inventory-1',
    traceId: 'trace-inventory-1',
  },
];

export async function registerApiMocks(page) {
  const state = {
    profile: {
      id: 7,
      name: 'Raman Tayal',
      email: 'frontend.demo@observability.local',
      role: 'Staff Software Engineer',
      avatarUrl: '',
      teams: [team],
    },
  };

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/auth/login' && method === 'POST') {
      return json(route, {
        token: 'demo-token',
        user: state.profile,
        teams: [team],
        currentTeam: team,
      });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      return json(route, { ok: true });
    }

    if (path === '/api/alerts/count/active' && method === 'GET') {
      return json(route, 2);
    }

    if (path === '/api/alerts' && method === 'GET') {
      return json(route, [
        {
          id: 1,
          name: 'Payments error budget burn',
          severity: 'critical',
          serviceName: 'payments',
          triggeredAt: minutesAgo(6),
          status: 'ACTIVE',
        },
        {
          id: 2,
          name: 'Checkout latency regression',
          severity: 'warning',
          serviceName: 'checkout',
          triggeredAt: minutesAgo(14),
          status: 'ACKNOWLEDGED',
        },
      ]);
    }

    if (path.startsWith('/api/v1/dashboard-config/') && method === 'GET') {
      return json(route, { configYaml: 'charts: []\n' });
    }

    if (path === '/api/v1/overview/summary' && method === 'GET') {
      return json(route, {
        total_requests: 12_500,
        error_count: 135,
        error_rate: 1.08,
        avg_latency: 118,
        p95_latency: 240,
        p99_latency: 380,
      });
    }

    if (
      (path === '/api/v1/overview/timeseries' || path === '/api/v1/services/timeseries') &&
      method === 'GET'
    ) {
      return json(route, requestTimeseries);
    }

    if (
      (path === '/api/v1/overview/services' || path === '/api/v1/services/metrics') &&
      method === 'GET'
    ) {
      return json(route, services);
    }

    if (
      (path === '/api/v1/overview/endpoints/metrics' || path === '/api/v1/endpoints/metrics') &&
      method === 'GET'
    ) {
      return json(route, endpointMetrics);
    }

    if (
      (path === '/api/v1/overview/endpoints/timeseries' || path === '/api/v1/endpoints/timeseries') &&
      method === 'GET'
    ) {
      return json(route, requestTimeseries.map((point) => ({
        ...point,
        service_name: 'checkout',
        operation_name: 'POST /api/checkout',
        http_method: 'POST',
      })));
    }

    if (path === '/api/v1/metrics/summary' && method === 'GET') {
      return json(route, {
        total_requests: 12_500,
        error_count: 135,
        error_rate: 1.08,
        avg_latency: 118,
        p95_latency: 240,
        p99_latency: 380,
      });
    }

    if (path === '/api/v1/services/summary/total' && method === 'GET') {
      return json(route, { count: 3 });
    }

    if (path === '/api/v1/services/summary/healthy' && method === 'GET') {
      return json(route, { count: 1 });
    }

    if (path === '/api/v1/services/summary/degraded' && method === 'GET') {
      return json(route, { count: 1 });
    }

    if (path === '/api/v1/services/summary/unhealthy' && method === 'GET') {
      return json(route, { count: 1 });
    }

    if (path === '/api/v1/services/timeseries' && method === 'GET') {
      return json(route, serviceTimeseries);
    }

    if (path === '/api/v1/services/topology' && method === 'GET') {
      return json(route, {
        nodes: [
          { name: 'checkout', requestCount: 6500, errorRate: 0.8, avgLatency: 120, status: 'healthy' },
          { name: 'payments', requestCount: 3200, errorRate: 6.4, avgLatency: 185, status: 'unhealthy' },
          { name: 'inventory', requestCount: 2800, errorRate: 1.7, avgLatency: 72, status: 'degraded' },
        ],
        edges: [
          { source: 'checkout', target: 'payments', callCount: 3200, avgLatency: 185, errorRate: 6.4 },
          { source: 'checkout', target: 'inventory', callCount: 2800, avgLatency: 72, errorRate: 1.7 },
        ],
      });
    }

    if (path === '/api/v1/logs/stats' && method === 'GET') {
      return json(route, {
        total: 35,
        fields: {
          level: [
            { value: 'ERROR', count: 7 },
            { value: 'WARN', count: 12 },
            { value: 'INFO', count: 16 },
          ],
          service_name: [
            { value: 'payments', count: 14 },
            { value: 'checkout', count: 11 },
            { value: 'inventory', count: 10 },
          ],
        },
      });
    }

    if (path === '/api/v1/logs/volume' && method === 'GET') {
      return json(route, {
        step: '5m',
        buckets: [
          { timeBucket: `${minutesAgo(25).slice(0, 16).replace('T', ' ')}:00`, total: 5, errors: 1, warnings: 2, infos: 2, debugs: 0, fatals: 0 },
          { timeBucket: `${minutesAgo(20).slice(0, 16).replace('T', ' ')}:00`, total: 7, errors: 2, warnings: 1, infos: 4, debugs: 0, fatals: 0 },
          { timeBucket: `${minutesAgo(15).slice(0, 16).replace('T', ' ')}:00`, total: 6, errors: 1, warnings: 2, infos: 3, debugs: 0, fatals: 0 },
        ],
      });
    }

    if (path === '/api/v1/logs' && method === 'GET') {
      return json(route, {
        logs,
        total: 35,
      });
    }

    if (path === '/api/settings/profile' && method === 'GET') {
      return json(route, state.profile);
    }

    if (path === '/api/settings/profile' && method === 'PUT') {
      const payload = JSON.parse(route.request().postData() || '{}');
      state.profile = {
        ...state.profile,
        ...payload,
      };
      return json(route, state.profile);
    }

    return json(route, {});
  });

  return state;
}

export async function loginAsDemoUser(page) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('frontend.demo@observability.local');
  await page.getByTestId('login-password').fill('Demo@12345');
  await page.getByTestId('login-submit').click();
}
