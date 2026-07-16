import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

/** Host machine metadata from retained resource attributes. */
export interface HostAbout {
  readonly os_type?: string;
  readonly os_description?: string;
  readonly arch?: string;
  readonly host_id?: string;
  readonly cloud_provider?: string;
  readonly cloud_platform?: string;
  readonly cloud_region?: string;
  readonly cloud_zone?: string;
  readonly k8s_node_name?: string;
}

/** Mirrors hostdetail.HostOverview; nil KPIs mean the metric is not reported. */
export interface HostOverview {
  readonly host: string;
  readonly last_seen?: string;
  readonly environments: readonly string[];
  readonly namespaces: readonly string[];
  readonly cpu_pct: number | null;
  readonly memory_pct: number | null;
  readonly disk_pct: number | null;
  readonly load_1m: number | null;
  readonly load_5m: number | null;
  readonly load_15m: number | null;
  readonly process_count: number | null;
  readonly available_metrics: readonly string[];
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

/** Series endpoint for InfraMultiSeriesChart; pass `metric` via extraParams. */
export function hostSeriesEndpoint(host: string): string {
  return `${V1}/infrastructure/hosts/${encodeURIComponent(host)}/series`;
}
