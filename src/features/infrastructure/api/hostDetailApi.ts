import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

                                                               
export interface HostAbout {
  readonly osType?: string;
  readonly osDescription?: string;
  readonly arch?: string;
  readonly hostId?: string;
  readonly cloudProvider?: string;
  readonly cloudPlatform?: string;
  readonly cloudRegion?: string;
  readonly cloudZone?: string;
  readonly k8sNodeName?: string;
}

                                                                                 
export interface HostOverview {
  readonly host: string;
  readonly lastSeen?: string;
  readonly environments: readonly string[];
  readonly namespaces: readonly string[];
  readonly cpuPct: number | null;
  readonly memoryPct: number | null;
  readonly diskPct: number | null;
  readonly load1m: number | null;
  readonly load5m: number | null;
  readonly load15m: number | null;
  readonly processCount: number | null;
  readonly availableMetrics: readonly string[];
  readonly about?: HostAbout;
}

export type HostMetricGroup =
  | "cpu"
  | "load"
  | "memory"
  | "disk_io"
  | "filesystem"
  | "network_io"
  | "network_errors";

export function getHostOverview(
  host: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<HostOverview> {
  return api.get<HostOverview>(`${V1}/infrastructure/hosts/${encodeURIComponent(host)}/overview`, {
    params: { startTime, endTime },
  });
}

                                                                                
export function hostSeriesEndpoint(host: string): string {
  return `${V1}/infrastructure/hosts/${encodeURIComponent(host)}/series`;
}
