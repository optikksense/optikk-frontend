import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

/** Mirrors containerdetail.PodOverview; request_count 0 means no traffic. */
export interface PodOverview {
  readonly pod: string;
  readonly host?: string;
  readonly last_seen?: string;
  readonly containers: readonly string[];
  readonly services: readonly string[];
  readonly environments: readonly string[];
  readonly namespaces: readonly string[];
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly avg_latency_ms: number;
  readonly p95_latency_ms: number;
  readonly available_metrics: readonly string[];
}

export type PodMetricGroup =
  | "cpu"
  | "memory"
  | "network_io"
  | "network_errors"
  | "filesystem"
  | "restarts"
  | "jvm_memory";

export function getPodOverview(
  pod: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<PodOverview> {
  return api.get<PodOverview>(`${V1}/infrastructure/pods/${encodeURIComponent(pod)}/overview`, {
    params: { startTime, endTime },
  });
}

/** Series endpoint for SeriesChartCard; pass `metric` via extraParams. */
export function podSeriesEndpoint(pod: string): string {
  return `${V1}/infrastructure/pods/${encodeURIComponent(pod)}/series`;
}
