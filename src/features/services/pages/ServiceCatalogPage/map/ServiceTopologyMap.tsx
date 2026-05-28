import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import {
  type ServiceEdge,
  type ServiceNode,
  type TopologyResponse,
  getTopology,
} from "@/features/services/api/serviceCatalogApi";

function NodeCard({ node }: { node: ServiceNode }) {
  const tone =
    node.health === "healthy"
      ? "text-[var(--color-success,#10b981)]"
      : node.health === "degraded"
        ? "text-[var(--color-warning,#f59e0b)]"
        : "text-[var(--color-error,#ef4444)]";
  return (
    <li className="flex items-center justify-between rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated,rgba(255,255,255,0.03))] px-3 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-[13px] text-[var(--text-primary)]">
          {node.name}
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">
          {formatNumber(node.request_count)} req · {(node.error_rate * 100).toFixed(2)}% err
        </span>
      </div>
      <span className={`text-[11px] ${tone}`}>{node.health}</span>
    </li>
  );
}

function EdgeCard({ edge }: { edge: ServiceEdge }) {
  return (
    <li className="flex items-baseline justify-between rounded border border-[var(--border-color)] bg-[var(--bg-elevated,rgba(255,255,255,0.03))] px-3 py-1.5 text-[12px]">
      <span className="truncate font-mono text-[var(--text-primary)]">
        {edge.source} → {edge.target}
      </span>
      <span className="text-[var(--text-muted)]">
        {formatNumber(edge.call_count)} · p95 {Math.round(edge.p95_latency_ms)}ms
      </span>
    </li>
  );
}

function MapStats({ topology }: { topology: TopologyResponse | undefined }) {
  const nodes = topology?.nodes ?? [];
  const edges = topology?.edges ?? [];
  const degraded = nodes.filter((n) => n.health === "degraded").length;
  const unhealthy = nodes.filter((n) => n.health === "unhealthy").length;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Services" value={String(nodes.length)} />
      <Stat label="Edges" value={String(edges.length)} />
      <Stat label="Degraded" value={String(degraded)} accent="warn" />
      <Stat label="Unhealthy" value={String(unhealthy)} accent="err" />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "warn" | "err" }) {
  const tone =
    accent === "err"
      ? "text-[var(--color-error,#ef4444)]"
      : accent === "warn"
        ? "text-[var(--color-warning,#f59e0b)]"
        : "text-[var(--text-primary)]";
  return (
    <div className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2">
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{label}</div>
      <div className={`mt-1 font-semibold text-[18px] ${tone}`}>{value}</div>
    </div>
  );
}

export function ServiceTopologyMap() {
  const topologyQ = useTimeRangeQuery<TopologyResponse>("service-hub.topology", (_team, s, e) =>
    getTopology(s, e)
  );
  const sortedNodes = useMemo(
    () => [...(topologyQ.data?.nodes ?? [])].sort((a, b) => b.request_count - a.request_count),
    [topologyQ.data]
  );
  const sortedEdges = useMemo(
    () =>
      [...(topologyQ.data?.edges ?? [])].sort((a, b) => b.call_count - a.call_count).slice(0, 50),
    [topologyQ.data]
  );
  return (
    <div className="flex flex-col gap-3">
      <MapStats topology={topologyQ.data} />
      <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
          Services
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {sortedNodes.map((node) => (
            <NodeCard key={node.name} node={node} />
          ))}
        </ul>
      </section>
      <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
          Top dependencies
        </div>
        <ul className="flex flex-col gap-1">
          {sortedEdges.map((edge) => (
            <EdgeCard key={`${edge.source}->${edge.target}`} edge={edge} />
          ))}
        </ul>
      </section>
    </div>
  );
}
