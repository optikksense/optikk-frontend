import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type HostStatus = "healthy" | "warn" | "error";

export interface HostForService {
  readonly host: string;
  readonly zone: string;
  readonly cpu_pct?: number;
  readonly mem_pct?: number;
  readonly rps: number;
  readonly error_rate: number;
  readonly p99_ms: number;
  readonly status: HostStatus;
  readonly last_seen: string;
  readonly request_count: number;
  readonly error_count: number;
}

function unwrap<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }
  const record = value as Record<string, unknown>;
  if ("data" in record && Object.keys(record).length <= 2) {
    return record.data as T;
  }
  return value as T;
}

export async function getHostsForService(
  startTime: RequestTime,
  endTime: RequestTime,
  serviceName: string
): Promise<HostForService[]> {
  const path = `${V1}/services/${encodeURIComponent(serviceName)}/hosts`;
  const raw = await api.get<unknown>(path, { params: { startTime, endTime } });
  return unwrap<HostForService[]>(raw);
}
