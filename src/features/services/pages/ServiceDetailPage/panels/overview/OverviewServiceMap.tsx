import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { fmtNum } from "../../formatters";
import { useServiceTopology } from "../../hooks/useServiceTopology";

interface ServiceMapNode {
  name: string;
  sub: string;
  x: number;
  y: number;
  status: "ok" | "warn" | "err";
  isCenter?: boolean;
}

interface ServiceMapEdge {
  path: string;
  width: number;
  color: string;
  label: string;
  lx: number;
  ly: number;
  dur: string;
  delay: string;
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

    // Filter upstream edges pointing to selectedFocus
    const upEdges = rawEdges.filter((e) => e.target === selectedFocus);
    // Filter downstream edges originating from selectedFocus
    const downEdges = rawEdges.filter((e) => e.source === selectedFocus);

    const mapStatus = (rate: number): "ok" | "warn" | "err" => {
      if (rate >= 2) return "err";
      if (rate >= 0.5) return "warn";
      return "ok";
    };

    // Calculate layout coordinates
    const computedNodes: ServiceMapNode[] = [];
    const computedEdges: ServiceMapEdge[] = [];
    const upList: any[] = [];
    const downList: any[] = [];

    // Place center node
    const centerNodeStatus = focusNode ? mapStatus(focusNode.error_rate) : "ok";
    computedNodes.push({
      name: selectedFocus,
      sub: "Active Service",
      x: 350,
      y: 155,
      status: centerNodeStatus,
      isCenter: true,
    });

    // Position upstreams on the left (x = 30)
    const uCount = upEdges.length;
    upEdges.forEach((edge, i) => {
      const nodeInfo = rawNodes.find((n) => n.name === edge.source);
      const status = nodeInfo ? mapStatus(nodeInfo.error_rate) : "ok";
      const y = uCount === 1 ? 180 : 30 + i * (340 / Math.max(1, uCount - 1));

      computedNodes.push({
        name: edge.source,
        sub: `upstream · ${edge.call_count} rps`,
        x: 30,
        y,
        status,
      });

      // Bezier curve from left node to center
      const path = `M 210,${y + 30} C 280,${y + 30} 280,185 350,200`;
      computedEdges.push({
        path,
        width: Math.max(2, Math.min(6, edge.call_count / 1000)),
        color: status === "err" ? "var(--err)" : status === "warn" ? "var(--warn)" : "var(--ok)",
        label: `${fmtNum(edge.call_count)} rps`,
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

    // Position downstreams on the right (x = 670)
    const dCount = downEdges.length;
    downEdges.forEach((edge, i) => {
      const nodeInfo = rawNodes.find((n) => n.name === edge.target);
      const status = nodeInfo ? mapStatus(nodeInfo.error_rate) : "ok";
      const y = dCount === 1 ? 180 : 30 + i * (340 / Math.max(1, dCount - 1));

      computedNodes.push({
        name: edge.target,
        sub: `downstream · ${edge.call_count} rps`,
        x: 670,
        y,
        status,
      });

      // Bezier curve from center to right node
      const path = `M 530,210 C 600,210 600,${y + 30} 670,${y + 30}`;
      computedEdges.push({
        path,
        width: Math.max(2, Math.min(6, edge.call_count / 1000)),
        color: status === "err" ? "var(--err)" : status === "warn" ? "var(--warn)" : "var(--ok)",
        label: `${fmtNum(edge.call_count)} rps`,
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
        {/* SVG Live Map */}
        <div className="relative rounded-lg border border-border bg-muted/10 p-2 lg:col-span-2">
          <svg
            viewBox="0 0 880 420"
            className="block h-[380px] w-full"
            role="img"
            aria-label="Service dependencies topology flow map"
          >
            <defs>
              <marker
                id="arrow-flow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" fill="var(--fg-mute)" opacity="0.4" />
              </marker>
              <pattern id="dot-grid-overview" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="0.6" fill="var(--fg-mute)" opacity="0.12" />
              </pattern>
            </defs>

            <rect width="880" height="420" fill="url(#dot-grid-overview)" rx="6" />

            {/* Column labels */}
            <text
              x="120"
              y="25"
              fontSize="9.5"
              fill="var(--fg-mute)"
              fontWeight="700"
              letterSpacing="1.5"
              textAnchor="middle"
            >
              UPSTREAM
            </text>
            <text
              x="440"
              y="25"
              fontSize="9.5"
              fill="var(--brand)"
              fontWeight="700"
              letterSpacing="1.5"
              textAnchor="middle"
            >
              THIS SERVICE
            </text>
            <text
              x="760"
              y="25"
              fontSize="9.5"
              fill="var(--fg-mute)"
              fontWeight="700"
              letterSpacing="1.5"
              textAnchor="middle"
            >
              DOWNSTREAM
            </text>

            {/* Edge paths and animated motion dots */}
            {edges.map((e, idx) => (
              <g key={idx}>
                {/* background glow */}
                <path
                  d={e.path}
                  stroke={e.color}
                  strokeOpacity="0.12"
                  strokeWidth={e.width + 4}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* flow line */}
                <path
                  d={e.path}
                  stroke={e.color}
                  strokeOpacity="0.75"
                  strokeWidth="1.2"
                  fill="none"
                  markerEnd="url(#arrow-flow)"
                />
                {/* rate label */}
                <text
                  x={e.lx}
                  y={e.ly}
                  fontSize="8.5"
                  fill="var(--fg-2)"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                  style={{ paintOrder: "stroke", stroke: "var(--bg-card)", strokeWidth: 3 }}
                >
                  {e.label}
                </text>
                {/* animated dots */}
                <circle r="2.5" fill={e.color}>
                  <animateMotion
                    dur={e.dur}
                    repeatCount="indefinite"
                    begin={e.delay}
                    path={e.path}
                  />
                </circle>
                <circle r="1.5" fill={e.color} opacity="0.6">
                  <animateMotion
                    dur={e.dur}
                    repeatCount="indefinite"
                    begin={`${(Number.parseFloat(e.delay) + Number.parseFloat(e.dur) / 2).toFixed(1)}s`}
                    path={e.path}
                  />
                </circle>
              </g>
            ))}

            {/* Nodes */}
            {nodes.map((n) => {
              const borderTheme =
                n.status === "err"
                  ? "stroke-[var(--err)]"
                  : n.status === "warn"
                    ? "stroke-[var(--warn)]"
                    : "stroke-[var(--ok)]";
              const fillTheme =
                n.status === "err"
                  ? "fill-[var(--err)]"
                  : n.status === "warn"
                    ? "fill-[var(--warn)]"
                    : "fill-[var(--ok)]";

              return (
                <g
                  key={n.name}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => n.name !== selectedFocus && setSelectedFocus(n.name)}
                  className="cursor-pointer"
                >
                  <rect
                    width="180"
                    height={n.isCenter ? "110" : "60"}
                    rx={n.isCenter ? "12" : "10"}
                    fill="var(--bg-card)"
                    stroke="var(--line)"
                    strokeWidth={n.isCenter ? "2" : "1"}
                  />
                  <rect
                    x="0"
                    y="0"
                    width="4"
                    height={n.isCenter ? "110" : "60"}
                    rx="2"
                    className={fillTheme}
                  />
                  <text
                    x="16"
                    y="25"
                    fontSize={n.isCenter ? "13.5" : "12.5"}
                    fontWeight="700"
                    fill="var(--fg-0)"
                  >
                    {n.name}
                  </text>
                  <text
                    x="16"
                    y="42"
                    fontSize="9.5"
                    fill="var(--fg-3)"
                    fontFamily="var(--font-mono)"
                  >
                    {n.sub}
                  </text>
                  <circle cx="166" cy="15" r="3.5" className={fillTheme} />

                  {n.isCenter && (
                    <>
                      <line
                        x1="16"
                        y1="54"
                        x2="164"
                        y2="54"
                        stroke="var(--line)"
                        strokeOpacity="0.3"
                      />
                      <text x="16" y="72" fontSize="10" fill="var(--fg-2)" fontWeight="600">
                        Active Focus node
                      </text>
                      <text
                        x="16"
                        y="88"
                        fontSize="10"
                        fill="var(--brand)"
                        fontWeight="600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(n.name);
                        }}
                        className="hover:underline"
                      >
                        view detail page →
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dependency Side List */}
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

            {/* Upstreams */}
            {upstreamList.map((d: any) => (
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
                            ? "var(--err)"
                            : d.status === "warn"
                              ? "var(--warn)"
                              : "var(--ok)",
                      }}
                    />
                    <span className="truncate font-mono font-semibold text-[12px] text-foreground">
                      {d.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-foreground-muted">
                    upstream · {fmtNum(d.callCount)} rps
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

            {/* Downstreams */}
            {downstreamList.map((d: any) => (
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
                            ? "var(--err)"
                            : d.status === "warn"
                              ? "var(--warn)"
                              : "var(--ok)",
                      }}
                    />
                    <span className="truncate font-mono font-semibold text-[12px] text-foreground">
                      {d.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-foreground-muted">
                    downstream · {fmtNum(d.callCount)} rps
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
