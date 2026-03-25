import React, { useState, useRef, useCallback, useEffect } from 'react';

import { APP_COLORS } from '@config/colorLiterals';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  STAGE_GAP_X,
  PAD_LEFT,
  truncate,
  inferDomain,
  nodeSeverity,
  buildPath,
} from './utils/graphUtils';
import { useServiceGraphLayout } from './hooks/useServiceGraphLayout';
import './ServiceGraph.css';

export interface ServiceGraphNode {
  readonly name: string;
  readonly status: string;
  readonly requestCount: number;
  readonly errorRate: number;
  readonly avgLatency: number;
  readonly riskScore?: number;
}

export interface ServiceGraphEdge {
  readonly source: string;
  readonly target: string;
  readonly callCount: number;
  readonly avgLatency: number;
  readonly p95LatencyMs: number;
  readonly errorRate: number;
}

interface ServiceGraphProps {
  readonly nodes?: readonly ServiceGraphNode[];
  readonly edges?: readonly ServiceGraphEdge[];
  readonly onNodeClick?: (node: ServiceGraphNode) => void;
}

/**
 * Interactive service dependency graph with force-directed layout and health status.
 * SVG-specific class names (service-flow-node, node-card, stage-pill, etc.) are kept
 * in ServiceGraph.css because Tailwind cannot target SVG fill/stroke properties.
 */
export default function ServiceGraph({ nodes = [], edges = [], onNodeClick }: ServiceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredNode, setHoveredNode] = useState<ServiceGraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<ServiceGraphEdge | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);

  const {
    stageColumns,
    positions,
    contentWidth,
    contentHeight,
    incidentCount,
    edges: graphEdges,
    maxCalls,
  } = useServiceGraphLayout(nodes, edges);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setExpanded(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const zoomIn = () => setScale((prev) => Math.min(2.8, prev + 0.12));
  const zoomOut = () => setScale((prev) => Math.max(0.45, prev - 0.12));
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const toggleExpand = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenEnabled || !el.requestFullscreen) {
      setExpanded((prev) => !prev);
      return;
    }

    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
        await el.requestFullscreen();
      }
    } catch (_) {
      setExpanded((prev) => !prev);
    }
  }, []);

  const handleWheel = useCallback((event: any) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    setScale((prev) => Math.min(2.8, Math.max(0.45, prev + (event.deltaY > 0 ? -0.08 : 0.08))));
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

    if (!dragging) return;
    const dx = (event.clientX - dragStart.x) / scale;
    const dy = (event.clientY - dragStart.y) / scale;
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => setDragging(false);

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-[color:var(--literal-hex-7e8595)] text-base">
        <p>No services to display</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`service-graph-container relative w-full overflow-hidden rounded-xl border border-[rgba(65,88,145,0.45)] min-h-[320px] ${expanded ? 'min-h-[70vh]' : ''}`}
      style={{
        background: `
          radial-gradient(circle at 8px 8px, var(--literal-rgba-63-89-140-0p35) 1px, transparent 1px),
          radial-gradient(circle at 8px 8px, var(--literal-rgba-14-25-48-0p95) 0, var(--literal-rgba-8-10-16-0p98) 80%)
        `,
        backgroundSize: '16px 16px, 100% 100%',
      }}
    >
      {/* Left toolbar */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
        <button
          className="min-w-[34px] h-8 border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[color:var(--literal-hex-d8dce8)] rounded-lg cursor-pointer text-[13px] font-semibold px-2.5 flex items-center justify-center transition-all duration-200 hover:border-[rgba(127,145,194,0.72)] hover:bg-[rgba(36,41,53,0.95)]"
          onClick={zoomOut}
          title="Zoom Out"
        >
          -
        </button>
        <div className="min-w-[56px] h-8 rounded-lg border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[color:var(--literal-hex-aab1c7)] text-[12px] font-bold flex items-center justify-center">
          {Math.round(scale * 100)}%
        </div>
        <button
          className="min-w-[34px] h-8 border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[color:var(--literal-hex-d8dce8)] rounded-lg cursor-pointer text-[13px] font-semibold px-2.5 flex items-center justify-center transition-all duration-200 hover:border-[rgba(127,145,194,0.72)] hover:bg-[rgba(36,41,53,0.95)]"
          onClick={zoomIn}
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* Right toolbar */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
        <button
          className="min-w-[34px] h-8 border border-[rgba(95,106,133,0.45)] bg-[rgba(15,18,25,0.82)] text-[color:var(--literal-hex-d8dce8)] rounded-lg cursor-pointer text-[13px] font-semibold px-2.5 flex items-center justify-center transition-all duration-200 hover:border-[rgba(127,145,194,0.72)] hover:bg-[rgba(36,41,53,0.95)]"
          onClick={resetView}
        >
          Reset View
        </button>
        <button
          className="min-w-[34px] h-8 border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] text-[color:var(--literal-hex-d8dce8)] rounded-lg cursor-pointer text-[13px] font-semibold px-2.5 flex items-center justify-center transition-all duration-200 hover:border-[rgba(127,145,194,0.72)] hover:bg-[rgba(36,41,53,0.95)]"
          onClick={toggleExpand}
        >
          {expanded ? 'Exit Expand' : 'Expand'}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${contentWidth} ${contentHeight}`}
        className="service-graph-svg"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker
            id="service-flow-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill={APP_COLORS.hex_5a6275_2} />
          </marker>
          <marker
            id="service-flow-arrow-critical"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill={APP_COLORS.hex_ff4d5a_2} />
          </marker>
          <filter id="critical-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2.8"
              floodColor={APP_COLORS.hex_ff4d5a_2}
              floodOpacity="0.55"
            />
          </filter>
        </defs>

        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          <g className="stage-label-layer">
            {stageColumns.map((_: any, stageIndex: number) => {
              const xCenter = PAD_LEFT + stageIndex * STAGE_GAP_X + NODE_WIDTH / 2;
              return (
                <g key={`stage-${stageIndex}`}>
                  <rect
                    x={xCenter - 46}
                    y={28}
                    width={92}
                    height={24}
                    rx={12}
                    className="stage-pill"
                  />
                  <text x={xCenter} y={44} textAnchor="middle" className="stage-pill-text">
                    {`STAGE ${stageIndex + 1}`}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="edge-layer">
            {graphEdges.map((edge: any, index: number) => {
              const source = positions[edge.source];
              const target = positions[edge.target];
              if (!source || !target) return null;

              const startX = source.x + NODE_WIDTH;
              const startY = source.y + NODE_HEIGHT / 2;
              const endX = target.x;
              const endY = target.y + NODE_HEIGHT / 2;
              const isCritical = Number(edge.errorRate || 0) > 5;
              const width =
                1.4 + (Number(edge.callCount || 0) / maxCalls) * 2 + (isCritical ? 1.1 : 0);

              return (
                <path
                  key={`${edge.source}-${edge.target}-${index}`}
                  d={buildPath(startX, startY, endX, endY)}
                  className={`service-flow-edge ${isCritical ? 'critical' : ''}`}
                  strokeWidth={width}
                  markerEnd={`url(#${isCritical ? 'service-flow-arrow-critical' : 'service-flow-arrow'})`}
                  filter={isCritical ? 'url(#critical-glow)' : undefined}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
              );
            })}
          </g>

          <g className="node-layer">
            {(nodes as any[]).map((node) => {
              const pos = positions[node.name];
              if (!pos) return null;

              const severity = nodeSeverity(node);
              const domain = inferDomain(node.name);
              const alerts = incidentCount.get(node.name) || 0;
              const domainBadgeWidth = Math.max(54, domain.length * 7 + 12);

              return (
                <g
                  key={node.name}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className={`service-flow-node ${severity.key}`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onNodeClick) onNodeClick(node);
                  }}
                  style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx="13"
                    className="node-card"
                  />
                  <rect
                    x="0"
                    y="10"
                    width="4"
                    height={NODE_HEIGHT - 20}
                    rx="2"
                    className="node-accent"
                  />

                  <text x="16" y="27" className="node-title">
                    {truncate(node.name, 30)}
                  </text>

                  <circle cx="18" cy="48" r="4" fill={severity.color} />
                  <text x="29" y="52" className="node-severity" fill={severity.color}>
                    {severity.label}
                  </text>

                  <rect
                    x="98"
                    y="38"
                    rx="6"
                    width={domainBadgeWidth}
                    height="18"
                    className="node-domain-badge"
                  />
                  <text x={106} y="51" className="node-domain-text">
                    {domain}
                  </text>

                  {alerts > 0 && (
                    <text x={NODE_WIDTH - 16} y="52" textAnchor="end" className="node-alert-text">
                      {`${alerts} ${alerts === 1 ? 'Alert' : 'Alerts'}`}
                    </text>
                  )}

                  <text x="16" y="76" className="node-metric-text">
                    {`Err ${Number(node.errorRate || 0).toFixed(2)}%`}
                  </text>
                  <text
                    x={NODE_WIDTH - 16}
                    y="76"
                    textAnchor="end"
                    className="node-metric-text muted"
                  >
                    {`${Number(node.avgLatency || 0).toFixed(0)}ms`}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Node tooltip */}
      {hoveredNode && (
        <div
          className="absolute bg-[rgba(21,24,32,0.96)] border border-[rgba(83,93,117,0.72)] rounded-lg p-[10px_11px] pointer-events-none z-[1000] min-w-[210px] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
        >
          <div className="text-[12px] font-bold text-[color:var(--literal-hex-eff2fa)] mb-2 pb-[7px] border-b border-[rgba(95,106,133,0.45)] font-mono">
            {hoveredNode.name}
          </div>
          <div className="flex justify-between items-center mb-1.5 text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Status</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {hoveredNode.status || 'unknown'}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1.5 text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Requests</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {Number(hoveredNode.requestCount || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1.5 text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Error Rate</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {Number(hoveredNode.errorRate || 0).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Latency</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {Number(hoveredNode.avgLatency || 0).toFixed(0)}ms
            </span>
          </div>
        </div>
      )}

      {/* Edge tooltip */}
      {hoveredEdge && !hoveredNode && (
        <div
          className="absolute bg-[rgba(21,24,32,0.96)] border border-[rgba(83,93,117,0.72)] rounded-lg p-[10px_11px] pointer-events-none z-[1000] min-w-[210px] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
        >
          <div className="text-[12px] font-bold text-[color:var(--literal-hex-eff2fa)] mb-2 pb-[7px] border-b border-[rgba(95,106,133,0.45)] font-mono">
            {`${hoveredEdge.source} -> ${hoveredEdge.target}`}
          </div>
          <div className="flex justify-between items-center mb-1.5 text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Calls</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {Number(hoveredEdge.callCount || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1.5 text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Error Rate</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {Number(hoveredEdge.errorRate || 0).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[color:var(--literal-hex-9ea8bf)] mr-3">Latency</span>
            <span className="text-[color:var(--literal-hex-e8ecf8)] font-semibold">
              {Number(hoveredEdge.avgLatency || 0).toFixed(0)}ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
