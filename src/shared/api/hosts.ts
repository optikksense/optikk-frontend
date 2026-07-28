import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

type HostStatus = "healthy" | "warn" | "error";

                                                                                
                                                                                 
                          
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
  readonly errorRate?: number;
  readonly p99Ms?: number;
  readonly status?: HostStatus;
  readonly lastSeen?: string;
  readonly requestCount?: number;
  readonly errorCount?: number;
}

export function getHosts(s: RequestTime, e: RequestTime, serviceName?: string): Promise<Host[]> {
  return api.get<Host[]>(`${V1}/infrastructure/hosts`, {
    params: serviceName
      ? { startTime: s, endTime: e, service: serviceName }
      : { startTime: s, endTime: e },
  });
}
