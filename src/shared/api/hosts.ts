import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

type HostStatus = "healthy" | "warn" | "error";

// Host is the unified row from GET /infrastructure/hosts. The saturation fields
// are always present; the RED traffic fields are populated only when the request
// is scoped to a service.
export interface Host {
  readonly host: string;
  readonly subsystem: string;
  readonly cpu: number;
  readonly mem: number;
  readonly disk: number;
  readonly saturation: number;
  readonly tone: string;
  readonly zone?: string;
  readonly rps?: number;
  readonly error_rate?: number;
  readonly p99_ms?: number;
  readonly status?: HostStatus;
  readonly last_seen?: string;
  readonly request_count?: number;
  readonly error_count?: number;
}

export function getHosts(s: RequestTime, e: RequestTime, serviceName?: string): Promise<Host[]> {
  return api.get<Host[]>(`${V1}/infrastructure/hosts`, {
    params: serviceName
      ? { startTime: s, endTime: e, service: serviceName }
      : { startTime: s, endTime: e },
  });
}
