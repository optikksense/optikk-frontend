import { api } from "@shared/api/api/client";

import type { InfraTopHost } from "../types";

export async function infraGet<T>(
  path: string,
  teamId: number,
  startMs: number,
  endMs: number,
  extraParams?: Record<string, string | number | undefined>
): Promise<T> {
  const params: Record<string, string | number> = {
    start: startMs,
    end: endMs,
  };
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== "") {
        params[k] = v;
      }
    }
  }
  return api.get<T>(path, { params });
}

/**
 * Top-N hosts ranked by a resource metric, descending. Thin variant over
 * `infraGet` that adds the `limit` query param shared by the cpu/top and
 * memory/top endpoints (e.g. "/v1/infrastructure/cpu/top").
 */
export function getTopHosts(
  path: string,
  teamId: number,
  startMs: number,
  endMs: number,
  limit: number
): Promise<readonly InfraTopHost[]> {
  return infraGet<readonly InfraTopHost[]>(path, teamId, startMs, endMs, { limit });
}
