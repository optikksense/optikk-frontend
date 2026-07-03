import type { RequestTime } from "@shared/api/service-types";

import { getJson } from "./overviewClient";

export interface FleetRedMetrics {
  service_count?: number;
  total_span_count?: number;
  total_errors?: number;
  total_rps?: number;
  avg_error_pct?: number;
  avg_p50_ms?: number;
  avg_p95_ms?: number;
  avg_p99_ms?: number;
  services?: any[];
}

export async function getFleetRedMetrics(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<FleetRedMetrics> {
  const overview = await getJson<{ totals: FleetRedMetrics; services: unknown[] }>(
    "/spans/red/fleet-overview",
    startTime,
    endTime
  );
  return { ...overview.totals, services: overview.services };
}

export function getPerformanceSeries(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/red/request-and-error-rate", startTime, endTime);
}
