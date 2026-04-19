/**
 * Static "frozen snapshot" data used on logged-out marketing + login previews.
 * No API calls, no real telemetry — numbers are plausible but hardcoded.
 */

const BUCKETS = 60;
const BUCKET_MS = 60_000;
const NOW_MS = Math.floor(Date.now() / BUCKET_MS) * BUCKET_MS;

export const DEMO_TIMESTAMPS_S: number[] = Array.from(
  { length: BUCKETS },
  (_, i) => (NOW_MS - (BUCKETS - 1 - i) * BUCKET_MS) / 1000
);

function shape(base: number, amp: number, phase: number, drift = 0): number[] {
  return Array.from({ length: BUCKETS }, (_, i) => {
    const t = i / BUCKETS;
    const wave = Math.sin((t + phase) * Math.PI * 3) * amp;
    const noise = Math.sin((t + phase) * Math.PI * 17) * amp * 0.25;
    return Math.max(0, Math.round((base + drift * t + wave + noise) * 100) / 100);
  });
}

export interface DemoServiceSeries {
  readonly name: string;
  readonly color: string;
  readonly requests: number[];
  readonly errors: number[];
  readonly p95Ms: number[];
}

export const DEMO_SERVICE_SERIES: readonly DemoServiceSeries[] = [
  {
    name: "checkout-api",
    color: "#8B7FFF",
    requests: shape(1840, 220, 0.1, 180),
    errors: shape(6.2, 2.0, 0.3),
    p95Ms: shape(128, 18, 0.2, 12),
  },
  {
    name: "payments-api",
    color: "#66C2A5",
    requests: shape(1120, 140, 0.4),
    errors: shape(2.4, 1.2, 0.1),
    p95Ms: shape(94, 14, 0.5),
  },
  {
    name: "catalog-api",
    color: "#F38B6B",
    requests: shape(2340, 280, 0.7, -80),
    errors: shape(4.1, 1.8, 0.6),
    p95Ms: shape(72, 10, 0.3),
  },
  {
    name: "search-api",
    color: "#6BB6FF",
    requests: shape(960, 150, 0.2),
    errors: shape(8.4, 3.0, 0.8),
    p95Ms: shape(182, 24, 0.9, 22),
  },
  {
    name: "notify-worker",
    color: "#F2C14E",
    requests: shape(430, 60, 0.55),
    errors: shape(0.8, 0.5, 0.4),
    p95Ms: shape(44, 8, 0.6),
  },
] as const;

function sumAt(index: number, key: keyof Pick<DemoServiceSeries, "requests" | "errors">): number {
  return DEMO_SERVICE_SERIES.reduce((acc, s) => acc + s[key][index], 0);
}

function p95At(index: number): number {
  const values = DEMO_SERVICE_SERIES.map((s) => s.p95Ms[index]).sort((a, b) => a - b);
  const rank = Math.max(0, Math.ceil(values.length * 0.95) - 1);
  return values[rank];
}

export const DEMO_REQUEST_TOTALS: number[] = DEMO_TIMESTAMPS_S.map((_, i) => sumAt(i, "requests"));
export const DEMO_ERROR_TOTALS: number[] = DEMO_TIMESTAMPS_S.map((_, i) => sumAt(i, "errors"));
export const DEMO_P95_FLEET: number[] = DEMO_TIMESTAMPS_S.map((_, i) => p95At(i));

const lastIdx = BUCKETS - 1;
const latestRequests = DEMO_REQUEST_TOTALS[lastIdx];
const latestErrors = DEMO_ERROR_TOTALS[lastIdx];

export interface DemoServiceRow {
  readonly name: string;
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly p95Latency: number;
}

function statusFromRate(rate: number): DemoServiceRow["status"] {
  if (rate > 5) return "unhealthy";
  if (rate > 1) return "degraded";
  return "healthy";
}

export const DEMO_SERVICE_ROWS: readonly DemoServiceRow[] = DEMO_SERVICE_SERIES.map((s) => {
  const requestCount = Math.round(s.requests.reduce((a, b) => a + b, 0));
  const errorCount = Math.round(s.errors.reduce((a, b) => a + b, 0));
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  const p95 = Math.round(s.p95Ms[s.p95Ms.length - 1]);
  return {
    name: s.name,
    status: statusFromRate(errorRate),
    requestCount,
    errorCount,
    errorRate,
    p95Latency: p95,
  };
});

export const DEMO_KPIS = {
  requestsPerMin: Math.round(latestRequests),
  errorsPerMin: Math.round(latestErrors),
  errorRate: latestRequests > 0 ? (latestErrors / latestRequests) * 100 : 0,
  p50Ms: 62,
  p95Ms: Math.round(DEMO_P95_FLEET[lastIdx]),
  p99Ms: Math.round(DEMO_P95_FLEET[lastIdx] * 1.65),
  servicesHealthy: DEMO_SERVICE_ROWS.filter((r) => r.status === "healthy").length,
  servicesTotal: DEMO_SERVICE_ROWS.length,
} as const;

export const DEMO_REQUEST_SPARK: number[] = DEMO_REQUEST_TOTALS.slice(-24);
export const DEMO_ERROR_SPARK: number[] = DEMO_ERROR_TOTALS.slice(-24);
export const DEMO_P95_SPARK: number[] = DEMO_P95_FLEET.slice(-24);

export interface DemoLogRow {
  readonly tsMs: number;
  readonly level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  readonly service: string;
  readonly message: string;
}

export const DEMO_LOG_ROWS: readonly DemoLogRow[] = [
  { tsMs: NOW_MS - 2_000, level: "INFO", service: "checkout-api", message: "POST /checkout → 200 in 112ms trace_id=8f3c…" },
  { tsMs: NOW_MS - 8_000, level: "WARN", service: "search-api", message: "elasticsearch query exceeded 500ms budget (took 612ms)" },
  { tsMs: NOW_MS - 14_000, level: "ERROR", service: "payments-api", message: "stripe.charge failed: card_declined (customer=cus_MkJ…)" },
  { tsMs: NOW_MS - 22_000, level: "INFO", service: "catalog-api", message: "cache hit rate 94.2% over last 1m window" },
  { tsMs: NOW_MS - 31_000, level: "INFO", service: "notify-worker", message: "enqueued 48 email notifications (topic=order.placed)" },
  { tsMs: NOW_MS - 44_000, level: "ERROR", service: "checkout-api", message: "kafka publish timeout after 3 retries (topic=order.placed)" },
  { tsMs: NOW_MS - 58_000, level: "INFO", service: "payments-api", message: "refund processed amount=$89.00 order=ORD-1139" },
  { tsMs: NOW_MS - 72_000, level: "DEBUG", service: "search-api", message: "reindex batch=128 docs flushed in 94ms" },
] as const;

export interface DemoSpan {
  readonly name: string;
  readonly service: string;
  readonly startMs: number;
  readonly durMs: number;
  readonly depth: number;
  readonly critical: boolean;
  readonly error?: boolean;
}

export const DEMO_TRACE = {
  rootName: "POST /checkout",
  totalMs: 318,
  spans: [
    { name: "POST /checkout", service: "gateway", startMs: 0, durMs: 318, depth: 0, critical: true },
    { name: "auth.verify", service: "auth-api", startMs: 4, durMs: 22, depth: 1, critical: false },
    { name: "cart.load", service: "catalog-api", startMs: 28, durMs: 54, depth: 1, critical: true },
    { name: "pricing.quote", service: "pricing-api", startMs: 84, durMs: 41, depth: 1, critical: true },
    { name: "payments.charge", service: "payments-api", startMs: 128, durMs: 142, depth: 1, critical: true, error: false },
    { name: "stripe.charge", service: "payments-api", startMs: 138, durMs: 124, depth: 2, critical: true },
    { name: "order.persist", service: "checkout-api", startMs: 274, durMs: 31, depth: 1, critical: true },
    { name: "notify.enqueue", service: "notify-worker", startMs: 308, durMs: 8, depth: 1, critical: false },
  ] as readonly DemoSpan[],
} as const;

export interface DemoLlmRun {
  readonly model: string;
  readonly prompt: string;
  readonly tokens: number;
  readonly latencyMs: number;
  readonly costCents: number;
  readonly evalScore: number;
}

export const DEMO_LLM_RUNS: readonly DemoLlmRun[] = [
  { model: "claude-sonnet-4-6", prompt: "Summarize the attached incident report…", tokens: 2840, latencyMs: 1420, costCents: 1.8, evalScore: 0.92 },
  { model: "gpt-4o-mini", prompt: "Classify this support ticket (billing / bug / feature)…", tokens: 612, latencyMs: 380, costCents: 0.11, evalScore: 0.87 },
  { model: "claude-haiku-4-5", prompt: "Extract entities from customer email…", tokens: 940, latencyMs: 510, costCents: 0.24, evalScore: 0.94 },
  { model: "claude-opus-4-7", prompt: "Draft a change plan for the payments refactor…", tokens: 4210, latencyMs: 3880, costCents: 4.6, evalScore: 0.96 },
] as const;
