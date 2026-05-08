import api from "@/shared/api/api/client";
import type { RequestTime } from "@shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

type Params = Record<string, RequestTime | string | number | undefined>;

function unwrap<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }
  const record = value as Record<string, unknown>;
  if (!("data" in record)) return value as T;
  const keys = Object.keys(record);
  if (keys.length <= 2 && (keys.length === 1 || "comparison" in record)) {
    return record.data as T;
  }
  return value as T;
}

function buildParams(
  startTime: RequestTime,
  endTime: RequestTime,
  serviceName?: string,
  extra?: Params
): Params {
  const params: Params = { startTime, endTime, ...extra };
  if (serviceName) params.serviceName = serviceName;
  return params;
}

async function getJson<T>(path: string, params: Params): Promise<T> {
  const raw = await api.get<unknown>(`${V1}${path}`, { params });
  return unwrap<T>(raw);
}

export interface ApdexPoint {
  readonly service_name?: string;
  readonly apdex?: number;
  readonly satisfied?: number;
  readonly tolerating?: number;
  readonly frustrated?: number;
}

export interface Http5xxRoutePoint {
  readonly service_name?: string;
  readonly http_route?: string;
  readonly count?: number;
  readonly rate?: number;
}

export interface FingerprintTrendPoint {
  readonly timestamp?: string;
  readonly count?: number;
}

export interface ErrorFingerprint {
  readonly fingerprint: string;
  readonly serviceName: string;
  readonly operationName: string;
  readonly exceptionType: string;
  readonly statusMessage: string;
  readonly firstSeen: string;
  readonly lastSeen: string;
  readonly count: number;
  readonly sampleTraceId: string;
}

export interface LatencyDuringErrorPoint {
  readonly timestamp?: string;
  readonly p95_latency_in_error_window?: number;
  readonly p95_latency_in_normal_window?: number;
  readonly error_window_count?: number;
}

export interface SloStats {
  readonly sli?: number;
  readonly slo?: number;
  readonly good_events?: number;
  readonly total_events?: number;
}

export const serviceDetailApi = {
  getApdex(
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<ApdexPoint[]> {
    return getJson("/spans/red/apdex", buildParams(startTime, endTime, serviceName));
  },

  getHttp5xxByRoute(
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<Http5xxRoutePoint[]> {
    return getJson("/spans/http-5xx-by-route", buildParams(startTime, endTime, serviceName));
  },

  listFingerprints(
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
    limit = 20
  ): Promise<ErrorFingerprint[]> {
    return getJson(
      "/errors/fingerprints",
      buildParams(startTime, endTime, serviceName, { limit })
    );
  },

  getFingerprintTrends(
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
    operationName: string,
    exceptionType?: string,
    statusMessage?: string
  ): Promise<FingerprintTrendPoint[]> {
    return getJson(
      "/errors/fingerprints/trend",
      buildParams(startTime, endTime, serviceName, {
        operationName,
        exceptionType,
        statusMessage,
      })
    );
  },

  getLatencyDuringErrorWindows(
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<LatencyDuringErrorPoint[]> {
    return getJson(
      "/errors/latency-during-error-windows",
      buildParams(startTime, endTime, serviceName)
    );
  },

  getSloStats(
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<SloStats> {
    return getJson("/slo/stats", buildParams(startTime, endTime, serviceName));
  },
};
