import { useMemo } from "react";
import type uPlot from "uplot";

import {
  type DeploymentMarker,
  deploymentMarkersPlugin,
} from "@shared/components/ui/charts/helpers/deploymentMarkersPlugin";
import { tsMs } from "@shared/utils/chartDataUtils";
import { resolveThemeColor } from "@shared/utils/chartTheme";

import { useServiceDeploys } from "./useServiceDeploys";

/** Subtle dashed marker tones, resolved from theme tokens. */
function markerColors(): { color: string; labelColor: string } {
  const muted = resolveThemeColor("--text-muted", "#8e96a9");
  // Lines slightly fainter than labels so they stay in the background.
  return { color: `${muted}66`, labelColor: muted };
}

/**
 * Builds uPlot deployment-marker plugins for the current service's signal
 * charts. A deploy's "timestamp" is its `first_seen` — when traffic for that
 * version first appeared in the selected window — converted to unix-seconds to
 * match the chart x-axis. Returns an empty array until deploys load so callers
 * can spread the result into `ObservabilityChart`'s `plugins` prop.
 */
export function useDeployMarkers(serviceName: string): uPlot.Plugin[] {
  const { data } = useServiceDeploys(serviceName);

  return useMemo(() => {
    const markers: DeploymentMarker[] = (data?.deployments ?? [])
      .map((row) => ({
        ts: tsMs(row.first_seen) / 1000,
        version: row.version,
        environment: row.environment,
      }))
      .filter((marker) => Number.isFinite(marker.ts) && marker.version.length > 0);

    if (markers.length === 0) return [];
    const { color, labelColor } = markerColors();
    return [deploymentMarkersPlugin({ markers, color, labelColor })];
  }, [data]);
}
