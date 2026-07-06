import { VisualizationErrorBoundary } from "@shared/components/ui/error-boundary/VisualizationErrorBoundary";
import { CHART_THEME_DEFAULTS } from "@shared/utils/chartTheme";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { fmtNum } from "../../formatters";
import { useServiceTopology } from "../../hooks/useServiceTopology";
import { type ServiceMapEdge, type ServiceMapNode, TopologySVG } from "./TopologySVG";

interface ServiceMapListItem {
  name: string;
  callCount: number;
  errorRate: number;
  status: "ok" | "warn" | "err";
}

export function OverviewServiceMap({ serviceName }: { serviceName: string }) {
  const navigate = useNavigate();
  const [selectedFocus, setSelectedFocus] = useState(serviceName);
  const topologyQ = useServiceTopology(selectedFocus);

  const loading = topologyQ.isPending;

  // Process data from TopologyResponse
  const { nodes, edges, upstreamList, downstreamList } = useMemo(() => {
    if (!topologyQ.data) {
      return { nodes: [], edges: [], upstreamList: [], downstreamList: [] };
    }

    const rawNodes = topologyQ.data.nodes ?? [];
    const rawEdges = topologyQ.data.edges ?? [];

    const focusNode = rawNodes.find((n) => n.name === selectedFocus);

    const upEdges = rawEdges.filter((e) => e.target === selectedFocus);

    const downEdges = rawEdges.filter((e) => e.source === selectedFocus);

    const mapStatus = (rate: number): "ok" | "warn" | "err" => {
      if (rate >= 2) return "err";
      if (rate >= 0.5) return "warn";
      return "ok";
    };

    const computedNodes: ServiceMapNode[] = [];
    const computedEdges: ServiceMapEdge[] = [];
    const upList: ServiceMapListItem[] = [];
    const downList: ServiceMapListItem[] = [];

    const centerNodeStatus = focusNode ? mapStatus(focusNode.error_rate) : "ok";
    computedNodes.push({
      name: selectedFocus,
      sub: "Active Service",
      x: 350,
      y: 155,
      status: centerNodeStatus,
      isCenter: true,
    });

    const uCount = upEdges.length;
    upEdges.forEach((edge, i) => {
      const nodeInfo = rawNodes.find((n) => n.name === edge.source);
      const status = nodeInfo ? mapStatus(nodeInfo.error_rate) : "ok";
      const y = uCount === 1 ? 180 : 30 + i * (340 / Math.max(1, uCount - 1));

      computedNodes.push({
        name: edge.source,
        sub: `upstream · ${edge.call_count} calls`,
        x: 30,
        y,
        status,
      });

      const path = `M 210,${y + 30} C 280,${y + 30} 280,185 350,200`;
      computedEdges.push({
        path,
        width: Math.max(2, Math.min(6, edge.call_count / 1000)),
        color:
          status === "err"
            ? CHART_THEME_DEFAULTS.err()
            : status === "warn"
              ? CHART_THEME_DEFAULTS.warn()
              : CHART_THEME_DEFAULTS.ok(),
        label: `${fmtNum(edge.call_count)} calls`,
        lx: 280,
        ly: y + 20,
        dur: "3s",
        delay: `${(i * 0.4).toFixed(1)}s`,
      });

      upList.push({
        name: edge.source,
        callCount: edge.call_count,
        errorRate: edge.error_rate,
        status,
      });
    });

    const dCount = downEdges.length;
    downEdges.forEach((edge, i) => {
      const nodeInfo = rawNodes.find((n) => n.name === edge.target);
      const status = nodeInfo ? mapStatus(nodeInfo.error_rate) : "ok";
      const y = dCount === 1 ? 180 : 30 + i * (340 / Math.max(1, dCount - 1));

      computedNodes.push({
        name: edge.target,
        sub: `downstream · ${edge.call_count} calls`,
        x: 670,
        y,
        status,
      });

      const path = `M 530,210 C 600,210 600,${y + 30} 670,${y + 30}`;
      computedEdges.push({
        path,
        width: Math.max(2, Math.min(6, edge.call_count / 1000)),
        color:
          status === "err"
            ? CHART_THEME_DEFAULTS.err()
            : status === "warn"
              ? CHART_THEME_DEFAULTS.warn()
              : CHART_THEME_DEFAULTS.ok(),
        label: `${fmtNum(edge.call_count)} calls`,
        lx: 600,
        ly: y + 20,
        dur: "2.8s",
        delay: `${(i * 0.5).toFixed(1)}s`,
      });

      downList.push({
        name: edge.target,
        callCount: edge.call_count,
        errorRate: edge.error_rate,
        status,
      });
    });

    return {
      nodes: computedNodes,
      edges: computedEdges,
      upstreamList: upList,
      downstreamList: downList,
    };
  }, [topologyQ.data, selectedFocus]);

  const handleNavigate = (svc: string) => {
    navigate({ to: `/services/${svc}` });
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-[440px] animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[14px] text-foreground">Service map</h3>
          <p className="mt-0.5 text-[12px] text-foreground-muted">
            Live request topology · click on nodes to inspect or navigate
          </p>
        </div>
        <div className="flex items-center gap-2">
          {topologyQ.data?.nodes && (
            <select
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              className="h-[28px] rounded-md border border-border bg-card px-2 font-medium text-[12px] text-foreground outline-none transition-colors hover:border-foreground-muted"
            >
              {topologyQ.data.nodes.map((n) => (
                <option key={n.name} value={n.name}>
                  Focus: {n.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {}
        <div className="relative rounded-lg border border-border bg-muted/10 p-2 lg:col-span-2">
          <VisualizationErrorBoundary>
            <TopologySVG
              nodes={nodes}
              edges={edges}
              selectedFocus={selectedFocus}
              onNodeClick={setSelectedFocus}
              onNavigate={handleNavigate}
            />
          </VisualizationErrorBoundary>
        </div>

        {}
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-[11px] text-foreground-muted uppercase tracking-wider">
            Service Dependencies ({upstreamList.length + downstreamList.length})
          </div>

          <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-0.5">
            {upstreamList.length === 0 && downstreamList.length === 0 && (
              <span className="text-[12.5px] text-foreground-muted">
                No dependencies captured for this service.
              </span>
            )}

            {}
            {upstreamList.map((d: ServiceMapListItem) => (
              <div
                key={d.name}
                onClick={() => setSelectedFocus(d.name)}
                className="flex cursor-pointer items-center justify-between rounded-md border border-border/40 bg-muted/15 p-2.5 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          d.status === "err"
                            ? CHART_THEME_DEFAULTS.err()
                            : d.status === "warn"
                              ? CHART_THEME_DEFAULTS.warn()
                              : CHART_THEME_DEFAULTS.ok(),
                      }}
                    />
                    <span className="truncate font-mono font-semibold text-[12px] text-foreground">
                      {d.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-foreground-muted">
                    upstream · {fmtNum(d.callCount)} calls
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium font-mono text-[11px] text-foreground">
                    {d.errorRate.toFixed(2)}%
                  </div>
                  <span className="text-[9.5px] text-foreground-muted">err rate</span>
                </div>
              </div>
            ))}

            {}
            {downstreamList.map((d: ServiceMapListItem) => (
              <div
                key={d.name}
                onClick={() => setSelectedFocus(d.name)}
                className="flex cursor-pointer items-center justify-between rounded-md border border-border/40 bg-muted/15 p-2.5 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          d.status === "err"
                            ? CHART_THEME_DEFAULTS.err()
                            : d.status === "warn"
                              ? CHART_THEME_DEFAULTS.warn()
                              : CHART_THEME_DEFAULTS.ok(),
                      }}
                    />
                    <span className="truncate font-mono font-semibold text-[12px] text-foreground">
                      {d.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-foreground-muted">
                    downstream · {fmtNum(d.callCount)} calls
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium font-mono text-[11px] text-foreground">
                    {d.errorRate.toFixed(2)}%
                  </div>
                  <span className="text-[9.5px] text-foreground-muted">err rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
