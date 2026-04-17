import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { saturationApi } from "../../../api/saturationApi";

/**
 * Bundles the seven queries that drive the datastore detail page.
 * Each is keyed on the team, time range, and `system`.
 */
export function useDatastoreData(system: string) {
  const extra = { extraKeys: [system] };
  return {
    overviewQuery: useTimeRangeQuery(
      "saturation-datastore-overview",
      (t, s, e) => saturationApi.getDatastoreOverview(system, t, s, e),
      extra
    ),
    serversQuery: useTimeRangeQuery(
      "saturation-datastore-servers",
      (t, s, e) => saturationApi.getDatastoreServers(system, t, s, e),
      extra
    ),
    namespacesQuery: useTimeRangeQuery(
      "saturation-datastore-namespaces",
      (t, s, e) => saturationApi.getDatastoreNamespaces(system, t, s, e),
      extra
    ),
    operationsQuery: useTimeRangeQuery(
      "saturation-datastore-operations",
      (t, s, e) => saturationApi.getDatastoreOperations(system, t, s, e),
      extra
    ),
    errorsQuery: useTimeRangeQuery(
      "saturation-datastore-errors",
      (t, s, e) => saturationApi.getDatastoreErrors(system, t, s, e),
      extra
    ),
    connectionsQuery: useTimeRangeQuery(
      "saturation-datastore-connections",
      (t, s, e) => saturationApi.getDatastoreConnections(system, t, s, e),
      extra
    ),
    slowQueriesQuery: useTimeRangeQuery(
      "saturation-datastore-slow-queries",
      (t, s, e) => saturationApi.getDatastoreSlowQueries(system, t, s, e),
      extra
    ),
  };
}
