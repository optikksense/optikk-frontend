import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { firstValue, tsMs } from "@shared/utils/chartDataUtils";

// Cross-feature reuse (sanctioned for the saturation host map): the host roster
// and per-instance system-metric series both live in the infrastructure feature.
import { infraGet } from "@/features/infrastructure/api/infrastructureApi";
import { getNodes } from "@/features/infrastructure/api/hostsApi";

export type HostFillMetric = "cpu" | "memory" | "disk";

const ENDPOINT: Record<HostFillMetric, string> = {
  cpu: "/v1/infrastructure/cpu/by-instance",
  memory: "/v1/infrastructure/memory/by-instance",
  disk: "/v1/infrastructure/disk/by-instance",
};

export interface HostSaturationNode {
  readonly host: string;
  /** Latest fill-metric value (percentage, 0–100 scale as emitted by the infra series). */
  readonly value: number;
}

interface MetricRow {
  readonly [key: string]: unknown;
}

/** Latest non-null `value` per host, keyed by host. */
function latestValueByHost(rows: MetricRow[]): Map<string, number> {
  const newest = new Map<string, { ts: number; value: number }>();
  for (const row of rows) {
    const host = String(firstValue(row, ["host", "instance", "pod"], ""));
    if (!host) continue;
    const value = Number(firstValue(row, ["value"], Number.NaN));
    if (!Number.isFinite(value)) continue;
    const ts = tsMs(firstValue(row, ["timestamp", "time_bucket"], ""));
    const stamp = Number.isFinite(ts) ? ts : 0;
    const prev = newest.get(host);
    if (!prev || stamp >= prev.ts) newest.set(host, { ts: stamp, value });
  }
  const out = new Map<string, number>();
  for (const [host, { value }] of newest) out.set(host, value);
  return out;
}

export function useHostSaturationMap(fill: HostFillMetric) {
  const nodesQ = useTimeRangeQuery("saturation-host-map.nodes", (_t, s, e) =>
    getNodes(Number(s), Number(e))
  );
  const metricQ = useTimeRangeQuery<MetricRow[]>(
    `saturation-host-map.metric.${fill}`,
    async (teamId, s, e) => {
      if (!teamId) return [];
      const data = await infraGet<MetricRow[]>(ENDPOINT[fill], teamId, Number(s), Number(e));
      return Array.isArray(data) ? data : [];
    },
    { extraKeys: [fill] }
  );

  const nodes = useMemo<HostSaturationNode[]>(() => {
    const byHost = latestValueByHost(metricQ.data ?? []);
    const roster = (nodesQ.data ?? []).map((n) => n.host);
    // Union of the host roster and hosts that only appear in the metric series.
    const hosts = new Set<string>([...roster, ...byHost.keys()]);
    return Array.from(hosts)
      .map((host) => ({ host, value: byHost.get(host) ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [nodesQ.data, metricQ.data]);

  return {
    nodes,
    isPending: nodesQ.isPending || metricQ.isPending,
    isError: Boolean(nodesQ.error || metricQ.error),
  };
}
