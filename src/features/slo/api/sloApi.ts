import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface SloObjectives {
  readonly availability_target: number;
  readonly p95_latency_target_ms: number;
}

export interface SloStatus {
  readonly availability_percent: number;
  readonly p95_latency_ms: number;
  readonly error_budget_remaining_percent: number;
  readonly compliant: boolean;
}

export interface SloSummary {
  readonly total_requests: number;
  readonly error_count: number;
  readonly availability_percent: number;
  readonly avg_latency_ms: number;
  readonly p95_latency_ms: number;
}

export interface SloTimeSlice {
  readonly timestamp: string;
  readonly request_count: number;
  readonly error_count: number;
  readonly availability_percent: number;
  readonly avg_latency_ms: number | null;
}

export interface SloResponse {
  readonly objectives: SloObjectives;
  readonly status: SloStatus;
  readonly summary: SloSummary;
  readonly timeseries: SloTimeSlice[];
}

export interface SloStatsResponse extends SloResponse {}

export interface BurnDownPoint {
  readonly timestamp: string;
  readonly error_budget_remaining_pct: number;
  readonly cumulative_error_count: number;
  readonly cumulative_request_count: number;
}

export interface BurnRate {
  readonly fast_burn_rate: number;
  readonly slow_burn_rate: number;
  readonly fast_window: string;
  readonly slow_window: string;
  readonly budget_remaining_pct: number;
}

interface SloFilter {
  readonly serviceName?: string;
}

function range(s: RequestTime, e: RequestTime, p?: SloFilter) {
  return { startTime: s, endTime: e, ...p };
}

export function getSlo(s: RequestTime, e: RequestTime, p?: SloFilter): Promise<SloResponse> {
  return api.get<SloResponse>(`${V1}/slo`, { params: range(s, e, p) });
}

export function getSloStats(
  s: RequestTime,
  e: RequestTime,
  p?: SloFilter
): Promise<SloStatsResponse> {
  return api.get<SloStatsResponse>(`${V1}/slo/stats`, { params: range(s, e, p) });
}

export function getBurnDown(
  s: RequestTime,
  e: RequestTime,
  p?: SloFilter
): Promise<BurnDownPoint[]> {
  return api.get<BurnDownPoint[]>(`${V1}/slo/burn-down`, { params: range(s, e, p) });
}

export function getBurnRate(
  s: RequestTime,
  e: RequestTime,
  p?: SloFilter
): Promise<BurnRate> {
  return api.get<BurnRate>(`${V1}/slo/burn-rate`, { params: range(s, e, p) });
}
