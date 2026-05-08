import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  datastoreConnectionRowSchema,
  datastoreErrorRowSchema,
  datastoreNamespaceRowSchema,
  datastoreOperationRowSchema,
  datastoreOverviewSchema,
  datastoreServerRowSchema,
  datastoreSummarySchema,
  datastoreSystemRowSchema,
  slowQueryPatternSchema,
} from "./datastoresExplorerSchemas";
import type {
  DatastoreConnectionRow,
  DatastoreErrorRow,
  DatastoreNamespaceRow,
  DatastoreOperationRow,
  DatastoreOverview,
  DatastoreServerRow,
  DatastoreSummary,
  DatastoreSystemRow,
  SlowQueryPattern,
} from "./datastoresExplorerSchemas";
import { getSaturation, rangeParams } from "./saturationClient";

function systemParams(system: string, startTime: RequestTime, endTime: RequestTime) {
  return { ...rangeParams(startTime, endTime), system };
}

export function getDatastoreSummary(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreSummary> {
  return getSaturation("/saturation/datastores/summary", datastoreSummarySchema, rangeParams(startTime, endTime));
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

export function getDatastoreOverview(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreOverview> {
  return getSaturation(
    "/saturation/datastores/system/overview",
    datastoreOverviewSchema,
    systemParams(system, startTime, endTime)
  );
}

export function getDatastoreServers(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreServerRow[]> {
  return getSaturation(
    "/saturation/datastores/system/servers",
    z.array(datastoreServerRowSchema),
    systemParams(system, startTime, endTime)
  );
}

export function getDatastoreNamespaces(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreNamespaceRow[]> {
  return getSaturation(
    "/saturation/datastores/system/namespaces",
    z.array(datastoreNamespaceRowSchema),
    systemParams(system, startTime, endTime)
  );
}

export function getDatastoreOperations(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreOperationRow[]> {
  return getSaturation(
    "/saturation/datastores/system/operations",
    z.array(datastoreOperationRowSchema),
    systemParams(system, startTime, endTime)
  );
}

export function getDatastoreErrors(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreErrorRow[]> {
  return getSaturation(
    "/saturation/datastores/system/errors",
    z.array(datastoreErrorRowSchema),
    systemParams(system, startTime, endTime)
  );
}

export function getDatastoreConnections(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DatastoreConnectionRow[]> {
  return getSaturation(
    "/saturation/datastores/system/connections",
    z.array(datastoreConnectionRowSchema),
    systemParams(system, startTime, endTime)
  );
}

export function getDatastoreSlowQueries(
  system: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<SlowQueryPattern[]> {
  return getSaturation(
    "/saturation/datastores/system/slow-queries",
    z.array(slowQueryPatternSchema),
    systemParams(system, startTime, endTime)
  );
}
