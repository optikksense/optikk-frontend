import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

/**
 * Minimal slice of `GET /api/v1/ingestion/overview` — just enough to tell
 * whether the tenant has received any telemetry yet, and from which service.
 */
export interface FirstDataSnapshot {
  readonly summary: {
    readonly totals: {
      readonly records: number;
      readonly spans: number;
      readonly logs: number;
      readonly metricDatapoints: number;
    };
  };
  readonly services: {
    readonly services: readonly { readonly name: string }[];
  };
}

export function getFirstDataSnapshot(
  startTime: number,
  endTime: number,
  signal?: AbortSignal
): Promise<FirstDataSnapshot> {
  return api.get<FirstDataSnapshot>(`${API_CONFIG.ENDPOINTS.V1_BASE}/ingestion/overview`, {
    params: { startTime, endTime },
    signal,
  });
}
