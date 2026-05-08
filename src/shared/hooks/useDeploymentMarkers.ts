import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { deploymentsApi } from "@/features/overview/api/deploymentsApi";
import type { DeploymentVersionTrafficPoint } from "@/features/overview/api/deploymentsApi";

export interface DeploymentMarker {
  readonly at: number;
  readonly label: string;
  readonly kind: "deployment";
  readonly version: string;
  readonly environment?: string;
}

function pickFirstSeenPerVersion(
  rows: readonly DeploymentVersionTrafficPoint[]
): Map<string, DeploymentVersionTrafficPoint> {
  const out = new Map<string, DeploymentVersionTrafficPoint>();
  for (const row of rows) {
    const existing = out.get(row.version);
    if (!existing || row.timestamp < existing.timestamp) {
      out.set(row.version, row);
    }
  }
  return out;
}

function toEpochMs(timestamp: string): number | null {
  const ms = Date.parse(timestamp);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Fetches deployment markers for the current time range, scoped to a service.
 * Designed for chart components — pass `markers` to UPlotChart's vertical-line
 * overlay. When `serviceName` is empty, returns no markers.
 */
export function useDeploymentMarkers(serviceName?: string): {
  markers: readonly DeploymentMarker[];
  isLoading: boolean;
} {
  const enabled = !!serviceName;

  const q = useTimeRangeQuery(
    `deployment-markers-${serviceName ?? "none"}`,
    (_t, s, e) =>
      enabled
        ? deploymentsApi.getVersionTraffic(serviceName ?? "", Number(s), Number(e))
        : Promise.resolve([] as DeploymentVersionTrafficPoint[]),
    { enabled }
  );

  const markers = useMemo<DeploymentMarker[]>(() => {
    if (!q.data?.length) return [];
    const firstByVersion = pickFirstSeenPerVersion(q.data);
    const out: DeploymentMarker[] = [];
    for (const [version, row] of firstByVersion) {
      const at = toEpochMs(row.timestamp);
      if (at == null) continue;
      out.push({
        at,
        kind: "deployment",
        version,
        label: version.length > 12 ? `${version.slice(0, 10)}…` : version,
      });
    }
    return out.sort((a, b) => a.at - b.at);
  }, [q.data]);

  return { markers, isLoading: q.isPending };
}
