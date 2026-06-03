import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { datastoreSystemRowSchema } from "./datastoresExplorerSchemas";
import type { DatastoreSummary, DatastoreSystemRow } from "./datastoresExplorerSchemas";
import { getSaturation, rangeParams } from "./saturationClient";

export async function getDatastoreSummary(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreSummary> {
  const systems = await getDatastoreSystems(startTime, endTime);
  const total_systems = systems.length;
  const database_systems = systems.filter((s) => s.category === "database").length;
  const redis_systems = systems.filter((s) => s.category === "redis").length;

  let query_count = 0;
  let weightedLatency = 0;
  let weightedErrorRate = 0;
  let active_connections = 0;

  for (const s of systems) {
    const qps = s.query_count ?? 0;
    query_count += qps;
    weightedLatency += (s.p95_latency_ms ?? 0) * Math.max(qps, 1);
    weightedErrorRate += (s.error_rate ?? 0) * Math.max(qps, 1);
    active_connections += s.active_connections ?? 0;
  }

  const denom = Math.max(1, query_count);
  return {
    total_systems,
    database_systems,
    redis_systems,
    query_count,
    p95_latency_ms: weightedLatency / denom,
    error_rate: weightedErrorRate / denom,
    active_connections,
  };
}

export function getDatastoreSystems(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreSystemRow[]> {
  return getSaturation(
    "/saturation/datastores/systems",
    z.array(datastoreSystemRowSchema),
    rangeParams(startTime, endTime)
  );
}
