import { useMemo } from "react";

import { type DeploymentRow, deploymentsApi } from "@/features/overview/api/deploymentsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type DeploymentMarker, deploymentMarkersPlugin } from "./deploymentMarkersPlugin";

function toMarker(row: DeploymentRow): DeploymentMarker | null {
  const ms = new Date(row.first_seen).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return {
    ts: Math.floor(ms / 1000),
    version: row.version,
    environment: row.environment,
  };
}

function toMarkers(rows: readonly DeploymentRow[]): DeploymentMarker[] {
  return rows.map(toMarker).filter((marker): marker is DeploymentMarker => marker !== null);
}

export function useDeploymentMarkers(serviceName: string): {
  markers: readonly DeploymentMarker[];
  plugin: ReturnType<typeof deploymentMarkersPlugin>;
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "deployment-markers",
    async (_teamId, startTime, endTime) => deploymentsApi.getList(serviceName, startTime, endTime),
    { extraKeys: [serviceName], enabled }
  );

  const markers = useMemo(() => toMarkers(query.data?.deployments ?? []), [query.data]);
  const plugin = useMemo(() => deploymentMarkersPlugin({ markers }), [markers]);

  return { markers, plugin, loading: query.isLoading && markers.length === 0 };
}
