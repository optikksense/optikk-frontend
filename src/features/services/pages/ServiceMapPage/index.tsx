import { Network } from "lucide-react";
import { useMemo } from "react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { getTopology } from "../../api/serviceCatalogApi";
import type { ServiceEdge, ServiceNode } from "../../api/serviceCatalogApi";

interface NodeListProps {
  readonly nodes: ServiceNode[];
}

function NodeList({ nodes }: NodeListProps) {
  if (nodes.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">No services in window.</div>;
  }
  return (
    <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {nodes.map((n) => (
        <li
          key={n.name}
          className="flex items-center justify-between rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2"
        >
          <div className="flex flex-col">
            <span className="font-medium text-[13px] text-[var(--text-primary)]">{n.name}</span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {formatNumber(n.request_count)} req · {(n.error_rate * 100).toFixed(2)}% err
            </span>
          </div>
          <span
            className="text-[11px]"
            style={{
              color:
                n.health === "healthy"
                  ? "#10b981"
                  : n.health === "degraded"
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          >
            {n.health}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface EdgeListProps {
  readonly edges: ServiceEdge[];
}

function EdgeList({ edges }: EdgeListProps) {
  if (edges.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">No edges in window.</div>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {edges.slice(0, 50).map((edge) => (
        <li
          key={`${edge.source}->${edge.target}`}
          className="flex items-center justify-between rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[12px]"
        >
          <span className="font-mono text-[var(--text-primary)]">
            {edge.source} → {edge.target}
          </span>
          <span className="text-[var(--text-muted)]">
            {formatNumber(edge.call_count)} calls · p95 {Math.round(edge.p95_latency_ms)}ms
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ServiceMapPage(): JSX.Element {
  const topologyQ = useTimeRangeQuery("service-map-topology", (_t, s, e) =>
    getTopology(Number(s), Number(e))
  );

  const stats = useMemo(() => {
    const nodes = topologyQ.data?.nodes ?? [];
    const edges = topologyQ.data?.edges ?? [];
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      unhealthyCount: nodes.filter((n) => n.health === "unhealthy").length,
      degradedCount: nodes.filter((n) => n.health === "degraded").length,
    };
  }, [topologyQ.data]);

  const sortedNodes = useMemo(
    () => [...(topologyQ.data?.nodes ?? [])].sort((a, b) => b.request_count - a.request_count),
    [topologyQ.data]
  );

  const sortedEdges = useMemo(
    () => [...(topologyQ.data?.edges ?? [])].sort((a, b) => b.call_count - a.call_count),
    [topologyQ.data]
  );

  return (
    <PageShell>
      <PageHeader
        title="Service map"
        subtitle="Service-to-service dependencies derived from CLIENT-kind spans."
        icon={<Network size={24} />}
      />

      <PageSurface elevation={1} padding="md">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Services
            </div>
            <div className="mt-1 font-semibold text-[20px] text-[var(--text-primary)]">
              {stats.nodeCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Edges
            </div>
            <div className="mt-1 font-semibold text-[20px] text-[var(--text-primary)]">
              {stats.edgeCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Degraded
            </div>
            <div className="mt-1 font-semibold text-[20px] text-amber-400">
              {stats.degradedCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Unhealthy
            </div>
            <div className="mt-1 font-semibold text-[20px] text-red-400">
              {stats.unhealthyCount}
            </div>
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-2 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Services
        </div>
        <NodeList nodes={sortedNodes} />
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-2 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Top dependencies
        </div>
        <EdgeList edges={sortedEdges} />
        <div className="mt-3 text-[11px] text-[var(--text-muted)]">
          Phase 2 follow-up: replace this list with a force-directed graph canvas; the data is
          identical to what existing topology code already renders inside ServiceHubPage.
        </div>
      </PageSurface>
    </PageShell>
  );
}
