import type { DashboardRecord } from "@/types/dashboardConfig";

export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

/** Normalize overview /overview/* timeseries points for RequestChart grouping. */
export function mapRequestRateRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      service_name: str(r.service_name ?? r.serviceName),
      request_count: num(r.request_count ?? r.requestCount),
    };
  });
}

export function mapErrorRateRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      service_name: str(r.service_name ?? r.serviceName),
      request_count: num(r.request_count),
      error_count: num(r.error_count),
      error_rate: num(r.error_rate ?? r.errorRate),
      error_pct: num(r.error_pct),
    };
  });
}

export function mapP95Rows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      service_name: str(r.service_name ?? r.serviceName),
      p95: num(r.p95_ms ?? r.p95 ?? r.p95Latency),
      avg_latency: num(r.avg_latency_ms ?? r.avg_latency),
      p50_latency: num(r.p50_ms ?? r.p50_latency),
      p95_latency: num(r.p95_ms ?? r.p95_latency),
      p99_latency: num(r.p99_ms ?? r.p99_latency),
    };
  });
}

/** RED span timeseries — uses `rps` or request-style fields. */
export function mapRedRequestRateRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      service_name: str(r.service_name ?? r.serviceName),
      value: num(r.rps ?? r.value ?? r.request_count),
      request_count: num(r.request_count ?? r.rps),
    };
  });
}

export function mapRedErrorPctRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    const pct = num(r.error_pct ?? r.error_rate);
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      service_name: str(r.service_name ?? r.serviceName),
      error_pct: pct,
      error_rate: pct,
      error_count: num(r.error_count),
      request_count: num(r.request_count),
    };
  });
}

export function mapApmTimeBucketRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      value: num(r.value ?? r.val),
    };
  });
}

export function mapApmCpuRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      state: str(r.state),
      value: num(r.value ?? r.val),
    };
  });
}

export function mapHttpStatusRateRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      status_code: str(r.status_code ?? r.statusCode),
      count: num(r.count ?? r.req_count),
    };
  });
}

export function mapExceptionTypeRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      exception_type: str(r.exception_type ?? r.exceptionType),
      count: num(r.count ?? r.event_count),
    };
  });
}

export function mapBurnDownRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      error_budget_remaining_pct: num(r.error_budget_remaining_pct),
      value: num(r.error_budget_remaining_pct),
    };
  });
}

export function mapHttpErrorTsRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      error_rate: num(r.error_rate),
      error_count: num(r.error_count),
      request_count: num(r.req_count ?? r.request_count),
    };
  });
}
