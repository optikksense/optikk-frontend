import { useState, useMemo, useRef, useCallback } from 'react';

import { APP_COLORS } from '@config/colorLiterals';

import type { ServiceGraphNode, ServiceGraphEdge } from '@shared/components/ui/charts/specialized/ServiceGraph';

import TopologyNode from './TopologyNode';
import TopologyEdge from './TopologyEdge';
import TopologyToolbar from './TopologyToolbar';
import TopologyMiniMap from './TopologyMiniMap';
import TopologyDetailPanel from './TopologyDetailPanel';
import { useTopologyLayout } from './hooks/useTopologyLayout';
import { useTopologyFilters } from './hooks/useTopologyFilters';
import { useTopologyInteractions } from './hooks/useTopologyInteractions';
import type { LayoutMode } from './utils/topologyLayoutAlgorithms';

interface ServiceTopologyMapProps {
  nodes: ServiceGraphNode[];
  edges: ServiceGraphEdge[];
  onNodeClick?: (node: ServiceGraphNode) => void;
}

export default function ServiceTopologyMap({
  nodes,
  edges,
  onNodeClick,
}: ServiceTopologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dag');
  const [animate, setAnimate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const nodeNames = useMemo(() => nodes.map((n) => n.name), [nodes]);
  const layoutEdges = useMemo(
    () => edges.map((e) => ({ source: e.source, target: e.target })),
    [edges]
  );
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.name, n])), [nodes]);

  const {
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    matchingNames,
    resetFilters,
    hasActiveFilters,
  } = useTopologyFilters(nodes);

  const {
    selectedNode, setSelectedNode,
    hoveredNode, setHoveredNode,
    hoveredEdge, setHoveredEdge,
    tooltipPos, setTooltipPos,
    scale, translate, dragging,
    zoomIn, zoomOut, resetView,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
  } = useTopologyInteractions();

  const { positions, width: canvasWidth, height: canvasHeight } = useTopologyLayout(
    nodeNames,
    layoutEdges,
    layoutMode
  );

  const maxCalls = useMemo(
    () => Math.max(...edges.map((e) => e.callCount), 1),
    [edges]
  );

  // Critical path: when hovering, find all connected nodes
  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return null;
    const connected = new Set<string>();
    connected.add(hoveredNode);
    // BFS upstream + downstream
    const adj = new Map<string, string[]>();
    for (const n of nodeNames) adj.set(n, []);
    for (const e of edges) {
      adj.get(e.source)?.push(e.target);
      adj.get(e.target)?.push(e.source);
    }
    const q = [hoveredNode];
    while (q.length) {
      const cur = q.shift()!;
      for (const nb of adj.get(cur) ?? []) {
        if (!connected.has(nb)) {
          connected.add(nb);
          q.push(nb);
        }
      }
    }
    return connected;
  }, [hoveredNode, edges, nodeNames]);

  const selectedNodeData = selectedNode ? (nodeMap.get(selectedNode) ?? null) : null;

  const toggleExpand = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
        setExpanded(false);
      } else {
        await el.requestFullscreen();
        setExpanded(true);
      }
    } catch {
      setExpanded((p) => !p);
    }
  }, []);

  const handleNodeClick = useCallback(
    (name: string) => {
      setSelectedNode((prev) => (prev === name ? null : name));
      const node = nodeMap.get(name);
      if (node && onNodeClick) onNodeClick(node);
    },
    [nodeMap, onNodeClick, setSelectedNode]
  );

  if (!nodes.length) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-[var(--text-muted)]">
        No services to display
      </div>
    );
  }

  const statusMap = Object.fromEntries(nodes.map((n) => [n.name, n.status]));

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-xl border border-[rgba(65,88,145,0.45)] ${expanded ? 'min-h-[80vh]' : 'h-full min-h-[500px]'}`}
      style={{
        background: `
          radial-gradient(circle at 8px 8px, rgba(63,89,140,0.12) 1px, transparent 1px),
          linear-gradient(135deg, rgba(14,25,48,0.95), rgba(8,10,16,0.98))
        `,
        backgroundSize: '16px 16px, 100% 100%',
      }}
    >
      {/* Toolbar */}
      <div className="relative z-10 p-3">
        <TopologyToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          animate={animate}
          onAnimateChange={setAnimate}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Zoom controls */}
      <div className="absolute top-16 right-3 z-10 flex flex-col gap-1">
        <button onClick={zoomIn} className="h-7 w-7 rounded border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-xs text-[var(--text-primary)] hover:bg-[rgba(36,41,53,0.95)]">+</button>
        <div className="flex h-7 w-7 items-center justify-center rounded border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[9px] text-[var(--text-muted)]">{Math.round(scale * 100)}%</div>
        <button onClick={zoomOut} className="h-7 w-7 rounded border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-xs text-[var(--text-primary)] hover:bg-[rgba(36,41,53,0.95)]">−</button>
        <button onClick={resetView} className="h-7 w-7 rounded border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[8px] text-[var(--text-muted)] hover:bg-[rgba(36,41,53,0.95)]" title="Reset">⟳</button>
        <button onClick={toggleExpand} className="h-7 w-7 rounded border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[8px] text-[var(--text-muted)] hover:bg-[rgba(36,41,53,0.95)]" title="Fullscreen">⛶</button>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <defs>
            <marker id="topo-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#5a6275" />
            </marker>
            <marker id="topo-arrow-critical" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={APP_COLORS.hex_ff4d5a ?? '#ff4d5a'} />
            </marker>
          </defs>

          <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
            {/* Edges */}
            <g>
              {edges.map((edge, i) => {
                const sp = positions[edge.source];
                const tp = positions[edge.target];
                if (!sp || !tp) return null;
                const dim =
                  hoveredNode !== null &&
                  connectedToHovered !== null &&
                  (!connectedToHovered.has(edge.source) || !connectedToHovered.has(edge.target));
                const filterDim =
                  hasActiveFilters &&
                  (!matchingNames.has(edge.source) && !matchingNames.has(edge.target));
                return (
                  <TopologyEdge
                    key={`${edge.source}-${edge.target}-${i}`}
                    edge={edge}
                    sourcePos={sp}
                    targetPos={tp}
                    maxCalls={maxCalls}
                    dimmed={dim || filterDim}
                    animate={animate}
                    onHover={setHoveredEdge}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const pos = positions[node.name];
                if (!pos) return null;
                const dim =
                  (hoveredNode !== null &&
                    connectedToHovered !== null &&
                    !connectedToHovered.has(node.name)) ||
                  (hasActiveFilters && !matchingNames.has(node.name));
                return (
                  <TopologyNode
                    key={node.name}
                    node={node}
                    x={pos.x}
                    y={pos.y}
                    dimmed={dim}
                    selected={selectedNode === node.name}
                    highlighted={hoveredNode === node.name}
                    onHover={setHoveredNode}
                    onClick={handleNodeClick}
                  />
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* Mini-map */}
      <TopologyMiniMap
        positions={positions}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        viewportScale={scale}
        viewportTranslate={translate}
        containerWidth={containerRef.current?.clientWidth ?? 800}
        containerHeight={containerRef.current?.clientHeight ?? 500}
        matchingNames={matchingNames}
        statusMap={statusMap}
      />

      {/* Node tooltip */}
      {hoveredNode && !selectedNode && (
        <div
          className="pointer-events-none absolute z-30 min-w-[200px] rounded-lg border border-[rgba(83,93,117,0.72)] bg-[rgba(21,24,32,0.96)] p-2.5 shadow-lg"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y + 14 }}
        >
          {(() => {
            const n = nodeMap.get(hoveredNode);
            if (!n) return null;
            return (
              <>
                <div className="mb-1.5 border-b border-[rgba(95,106,133,0.45)] pb-1.5 text-xs font-bold text-[#eff2fa] font-mono">{n.name}</div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between gap-3"><span className="text-[#9ea8bf]">Status</span><span className="font-semibold text-[#e8ecf8]">{n.status}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-[#9ea8bf]">Requests</span><span className="font-semibold text-[#e8ecf8]">{n.requestCount.toLocaleString()}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-[#9ea8bf]">Error Rate</span><span className="font-semibold text-[#e8ecf8]">{n.errorRate.toFixed(2)}%</span></div>
                  <div className="flex justify-between gap-3"><span className="text-[#9ea8bf]">Latency</span><span className="font-semibold text-[#e8ecf8]">{n.avgLatency.toFixed(0)}ms</span></div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Detail panel */}
      <TopologyDetailPanel
        selectedNode={selectedNodeData}
        selectedEdge={null}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
