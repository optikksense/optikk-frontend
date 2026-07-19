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
  const totalSystems = systems.length;
  const databaseSystems = systems.filter((s) => s.category === "database").length;
  const redisSystems = systems.filter((s) => s.category === "redis").length;

  let queryCount = 0;
  let weightedLatency = 0;
  let weightedErrorRate = 0;
  let activeConnections = 0;

  for (const s of systems) {
    const qps = s.queryCount ?? 0;
    queryCount += qps;
    weightedLatency += (s.p95LatencyMs ?? 0) * Math.max(qps, 1);
    weightedErrorRate += (s.errorRate ?? 0) * Math.max(qps, 1);
    activeConnections += s.activeConnections ?? 0;
  }

  const denom = Math.max(1, queryCount);
  return {
    totalSystems,
    databaseSystems,
    redisSystems,
    queryCount,
    p95LatencyMs: weightedLatency / denom,
    errorRate: weightedErrorRate / denom,
    activeConnections,
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
