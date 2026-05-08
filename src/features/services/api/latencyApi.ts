import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface LatencyHistogram {
  readonly p50: number;
  readonly p90: number;
  readonly p95: number;
  readonly p99: number;
  readonly max: number;
  readonly avg: number;
}

export interface HeatmapCell {
  readonly time_bucket: string;
  readonly bucket_ms: number;
  readonly count: number;
}

export interface HeatmapResponse {
  readonly cells: HeatmapCell[];
}

interface LatencyParams {
  readonly service?: string;
  readonly operation?: string;
}

function range(s: RequestTime, e: RequestTime, p?: LatencyParams) {
  return { startTime: s, endTime: e, ...p };
}

export function getLatencyHistogram(
  s: RequestTime,
  e: RequestTime,
  p?: LatencyParams
): Promise<LatencyHistogram> {
  return api.get<LatencyHistogram>(`${V1}/latency/histogram`, { params: range(s, e, p) });
}

export function getLatencyHeatmap(
  s: RequestTime,
  e: RequestTime,
  p?: { service?: string }
): Promise<HeatmapResponse> {
  return api.get<HeatmapResponse>(`${V1}/latency/heatmap`, { params: range(s, e, p) });
}
