import { useMemo } from "react";

import { Card } from "@shared/components/primitives/ui";

import type { InfraFillMetric, InfraGroupMode, InfraSizeMetric } from "../constants";
import { INFRA_GROUP, INFRA_SIZE } from "../constants";
import type { InfrastructureNode } from "../types";
import { groupLabelForNode, tierForNode } from "../utils/nodeHealth";

function fillValue(node: InfrastructureNode, fill: InfraFillMetric): number {
  switch (fill) {
    case "error_rate":
      return node.error_rate;
    case "avg_latency_ms":
      return node.avg_latency_ms;
    case "pod_count":
      return node.pod_count;
    case "request_count":
      return node.request_count;
    default:
      return 0;
  }
}

function sizeValue(node: InfrastructureNode, size: InfraSizeMetric): number {
  if (size === INFRA_SIZE.uniform) return 1;
  if (size === INFRA_SIZE.pod_count) return Math.max(1, node.pod_count);
  return Math.max(1, node.request_count);
}

function heatColor(t: number): string {
  if (t <= 0) return "rgba(115,201,145,0.85)";
  if (t < 0.33) return "rgba(115,201,145,0.65)";
  if (t < 0.55) return "rgba(247,144,9,0.55)";
  if (t < 0.75) return "rgba(247,144,9,0.75)";
  return "rgba(240,68,56,0.8)";
}

interface InfraFleetMapProps {
  readonly nodes: readonly InfrastructureNode[];
  readonly fill: InfraFillMetric;
  readonly size: InfraSizeMetric;
  readonly group: InfraGroupMode;
  readonly onHostClick: (host: string) => void;
}

export default function InfraFleetMap({
  nodes,
  fill,
  size,
  group,
  onHostClick,
}: InfraFleetMapProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, InfrastructureNode[]>();
    if (group === INFRA_GROUP.none) {
      map.set("Fleet", [...nodes]);
      return map;
    }
    for (const n of nodes) {
      const label =
        group === INFRA_GROUP.health ? tierForNode(n) : groupLabelForNode(n, "host_prefix");
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return map;
  }, [nodes, group]);

  const maxFill = useMemo(() => {
    let m = 0;
    for (const n of nodes) {
      const v = Math.abs(fillValue(n, fill));
      if (v > m) m = v;
    }
    return m > 0 ? m : 1;
  }, [nodes, fill]);

  const maxSize = useMemo(() => {
    let m = 0;
    for (const n of nodes) {
      const v = sizeValue(n, size);
      if (v > m) m = v;
    }
    return m > 0 ? m : 1;
  }, [nodes, size]);

  if (nodes.length === 0) {
    return (
      <Card padding="lg" className="text-center text-[13px] text-[var(--text-muted)]">
        No hosts in this time range.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {[...grouped.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, list]) => (
          <div key={groupName}>
            {group !== INFRA_GROUP.none ? (
              <div className="mb-2 font-semibold text-[12px] text-[var(--text-secondary)] uppercase tracking-[0.06em]">
                {groupName}
                <span className="ml-2 font-normal text-[var(--text-muted)] normal-case">
                  ({list.length} hosts)
                </span>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {list.map((node) => {
                const fv = fillValue(node, fill);
                const intensity = maxFill > 0 ? Math.min(1, Math.abs(fv) / maxFill) : 0;
                const sv = sizeValue(node, size);
                const dim = 36 + Math.round((sv / maxSize) * 44);
                const bg = heatColor(intensity);
                return (
                  <button
                    key={node.host}
                    type="button"
                    title={`${node.host}\n${fill}: ${fv.toFixed(2)}`}
                    onClick={() => onHostClick(node.host)}
                    className="flex items-center justify-center rounded-[10px] border border-[var(--border-color)] font-medium text-[10px] text-white shadow-sm transition-transform hover:scale-[1.03] hover:brightness-110"
                    style={{
                      width: dim,
                      height: dim,
                      background: bg,
                    }}
                  >
                    <span className="max-w-full truncate px-1">{node.host.split(".")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
