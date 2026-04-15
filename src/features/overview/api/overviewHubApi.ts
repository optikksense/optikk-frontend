import api from "@/shared/api/api/client";
import type { RequestTime } from "@shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

function rangeParams(startTime: RequestTime, endTime: RequestTime): Record<string, RequestTime> {
  return { startTime, endTime };
}

function unwrapComparisonPayload<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }

  const record = value as Record<string, unknown>;
  if (!("data" in record)) {
    return value as T;
  }

  const keys = Object.keys(record);
  if (keys.length <= 2 && (keys.length === 1 || "comparison" in record)) {
    return record.data as T;
  }

  return value as T;
}

async function getJson<T>(path: string, startTime: RequestTime, endTime: RequestTime): Promise<T> {
  const raw = await api.get<unknown>(`${V1}${path}`, { params: rangeParams(startTime, endTime) });
  return unwrapComparisonPayload<T>(raw);
}

async function getJsonWithParams<T>(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime,
  extra: Record<string, string | number | undefined>
): Promise<T> {
  const params: Record<string, RequestTime | string | number | undefined> = {
    ...rangeParams(startTime, endTime),
    ...extra,
  };
  const raw = await api.get<unknown>(`${V1}${path}`, { params });
  return unwrapComparisonPayload<T>(raw);
}

export type OverviewGlobalSummary = {
  total_requests?: number;
  error_count?: number;
  avg_latency?: number;
  p50_latency?: number;
  p95_latency?: number;
  p99_latency?: number;
};

export type RedSummary = {
  service_count?: number;
  total_span_count?: number;
  total_rps?: number;
  avg_error_pct?: number;
  avg_p50_ms?: number;
  avg_p95_ms?: number;
  avg_p99_ms?: number;
};

export type HistogramSummary = {
  p50?: number;
  p95?: number;
  p99?: number;
  avg?: number;
};

export type BurnRate = {
  fast_burn_rate?: number;
  slow_burn_rate?: number;
  budget_remaining_pct?: number;
};

export const overviewHubApi = {
  getOverviewSummary(startTime: RequestTime, endTime: RequestTime): Promise<OverviewGlobalSummary> {
    return getJson("/overview/summary", startTime, endTime);
  },

  getRedSummary(startTime: RequestTime, endTime: RequestTime): Promise<RedSummary> {
    return getJson("/spans/red/summary", startTime, endTime);
  },

  getLatencyBreakdown(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/spans/latency-breakdown", startTime, endTime);
  },

  getRedP95Series(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/spans/red/p95-latency", startTime, endTime);
  },

  getRedRequestRateSeries(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/spans/red/request-rate", startTime, endTime);
  },

  getRedErrorRateSeries(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/spans/red/error-rate", startTime, endTime);
  },

  getTopSlowOperations(startTime: RequestTime, endTime: RequestTime, limit = 25): Promise<unknown[]> {
    return getJsonWithParams("/spans/red/top-slow-operations", startTime, endTime, { limit });
  },

  getTopErrorOperations(startTime: RequestTime, endTime: RequestTime, limit = 25): Promise<unknown[]> {
    return getJsonWithParams("/spans/red/top-error-operations", startTime, endTime, { limit });
  },

  getApmRpcRequestRate(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/apm/rpc-request-rate", startTime, endTime);
  },

  getApmRpcDuration(startTime: RequestTime, endTime: RequestTime): Promise<HistogramSummary> {
    return getJson("/apm/rpc-duration", startTime, endTime);
  },

  getApmProcessCpu(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/apm/process-cpu", startTime, endTime);
  },

  getApmProcessMemory(startTime: RequestTime, endTime: RequestTime): Promise<{ rss?: number; vms?: number }> {
    return getJson("/apm/process-memory", startTime, endTime);
  },

  getApmOpenFds(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/apm/open-fds", startTime, endTime);
  },

  getErrorsServiceErrorRate(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/overview/errors/service-error-rate", startTime, endTime);
  },

  getErrorsVolume(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/overview/errors/error-volume", startTime, endTime);
  },

  getExceptionRateByType(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/spans/exception-rate-by-type", startTime, endTime);
  },

  getErrorHotspot(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/spans/error-hotspot", startTime, endTime);
  },

  getErrorGroups(startTime: RequestTime, endTime: RequestTime, limit = 100): Promise<unknown[]> {
    return getJsonWithParams("/overview/errors/groups", startTime, endTime, { limit });
  },

  getHttpRequestRate(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/http/request-rate", startTime, endTime);
  },

  getHttpRequestDuration(startTime: RequestTime, endTime: RequestTime): Promise<HistogramSummary> {
    return getJson("/http/request-duration", startTime, endTime);
  },

  getHttpStatusDistribution(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/http/status-distribution", startTime, endTime);
  },

  getHttpErrorTimeseries(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/http/error-timeseries", startTime, endTime);
  },

  getSloBurnRate(startTime: RequestTime, endTime: RequestTime): Promise<BurnRate> {
    return getJson("/overview/slo/burn-rate", startTime, endTime);
  },

  getSloBurnDown(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
    return getJson("/overview/slo/burn-down", startTime, endTime);
  },
};
