import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import './ServiceGraph.css';

const NODE_WIDTH = 252;
const NODE_HEIGHT = 94;
const NODE_GAP_Y = 34;
const STAGE_GAP_X = 320;
const PAD_LEFT = 80;
const PAD_RIGHT = 110;
const PAD_TOP = 88;
const PAD_BOTTOM = 70;

function truncate(text, max = 30) {
  const value = String(text || '');
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

function inferDomain(name = '') {
  const value = name.toLowerCase();
  if (value.includes('kafka') || value.includes('rabbit') || value.includes('sqs') || value.includes('pulsar')) return 'kafka';
  if (value.includes('redis') || value.includes('cache')) return 'redis';
  if (value.includes('postgres') || value.includes('mysql') || value.includes('mongo') || value.includes('sql') || value.includes('db')) return 'postgresql';
  if (value.includes('k8s') || value.includes('kube') || value.includes('pod')) return 'kubernetes';
  return 'application';
}

function nodeSeverity(node = {}) {
  const risk = Number(node.riskScore || 0);
  const status = String(node.status || '').toLowerCase();

  if (status === 'unhealthy' || risk >= 75) {
    return { key: 'critical', label: 'CRITICAL', color: '#FF4D5A' };
  }
  if (status === 'degraded' || risk >= 55) {
    return { key: 'high', label: 'HIGH', color: '#F7B63A' };
  }
  if (risk >= 30) {
    return { key: 'medium', label: 'MEDIUM', color: '#C8D43D' };
  }
  return { key: 'low', label: 'LOW', color: '#4ADE80' };
}

function buildPath(fromX, fromY, toX, toY) {
  const curve = Math.max((toX - fromX) * 0.45, 90);
  return `M ${fromX} ${fromY} C ${fromX + curve} ${fromY}, ${toX - curve} ${toY}, ${toX} ${toY}`;
}

function buildLayout(nodes, edges) {
  const names = nodes.map((n) => n.name).filter(Boolean);
  const nodeSet = new Set(names);
  const nodeMap = new Map(nodes.map((n) => [n.name, n]));

  const outgoing = new Map();
  const incoming = new Map();
  names.forEach((name) => {
    outgoing.set(name, []);
    incoming.set(name, 0);
  });

  const cleanEdges = edges.filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target) && edge.source !== edge.target);
  cleanEdges.forEach((edge) => {
    outgoing.get(edge.source).push(edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
  });

  const stageByName = new Map();
  const indegree = new Map(incoming);
  const queue = names.filter((name) => (indegree.get(name) || 0) === 0);
  queue.forEach((name) => stageByName.set(name, 0));

  const processed = new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    processed.add(current);
    const nextStage = (stageByName.get(current) || 0) + 1;
    (outgoing.get(current) || []).forEach((target) => {
      if (nextStage > (stageByName.get(target) || 0)) {
        stageByName.set(target, nextStage);
      }
      indegree.set(target, (indegree.get(target) || 0) - 1);
      if ((indegree.get(target) || 0) <= 0) {
        queue.push(target);
      }
    });
  }

  // Cycles or disconnected residues: distribute by iterative relaxation.
  if (processed.size < names.length) {
    names.forEach((name) => {
      if (!stageByName.has(name)) stageByName.set(name, 0);
    });
    for (let i = 0; i < names.length; i++) {
      let changed = false;
      cleanEdges.forEach((edge) => {
        const candidate = (stageByName.get(edge.source) || 0) + 1;
        if (candidate > (stageByName.get(edge.target) || 0)) {
          stageByName.set(edge.target, candidate);
          changed = true;
        }
      });
      if (!changed) break;
    }
  }

  const columns = [];
  names.forEach((name) => {
    const stage = Math.max(0, stageByName.get(name) || 0);
    if (!columns[stage]) columns[stage] = [];
    columns[stage].push(nodeMap.get(name));
  });

  const stageColumns = columns.filter(Boolean).map((column) => (
    [...column].sort((a, b) => {
      const sevDiff = (nodeSeverity(b).key === 'critical') - (nodeSeverity(a).key === 'critical');
      if (sevDiff !== 0) return sevDiff;
      return Number(b.riskScore || 0) - Number(a.riskScore || 0);
    })
  ));

  const maxCount = Math.max(...stageColumns.map((s) => s.length), 1);
  const contentHeight = Math.max(560, PAD_TOP + maxCount * NODE_HEIGHT + (maxCount - 1) * NODE_GAP_Y + PAD_BOTTOM);
  const contentWidth = Math.max(980, PAD_LEFT + (stageColumns.length - 1) * STAGE_GAP_X + NODE_WIDTH + PAD_RIGHT);

  const positions = {};
  stageColumns.forEach((stageNodes, stageIndex) => {
    const x = PAD_LEFT + stageIndex * STAGE_GAP_X;
    const totalHeight = stageNodes.length * NODE_HEIGHT + (stageNodes.length - 1) * NODE_GAP_Y;
    const startY = PAD_TOP + Math.max((contentHeight - PAD_TOP - PAD_BOTTOM - totalHeight) / 2, 0);
    stageNodes.forEach((node, idx) => {
      positions[node.name] = {
        x,
        y: startY + idx * (NODE_HEIGHT + NODE_GAP_Y),
      };
    });
  });

  const incidentCount = new Map(names.map((name) => [name, 0]));
  cleanEdges.forEach((edge) => {
    if (Number(edge.errorRate || 0) > 5) {
      incidentCount.set(edge.source, (incidentCount.get(edge.source) || 0) + 1);
      incidentCount.set(edge.target, (incidentCount.get(edge.target) || 0) + 1);
    }
  });

  return {
    stageColumns,
    positions,
    contentWidth,
    contentHeight,
    incidentCount,
    edges: cleanEdges,
  };
}

export default function ServiceGraph({ nodes = [], edges = [], onNodeClick }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);

  const { stageColumns, positions, contentWidth, contentHeight, incidentCount, edges: graphEdges } = useMemo(
    () => buildLayout(nodes, edges),
    [nodes, edges]
  );

  const maxCalls = useMemo(
    () => Math.max(...graphEdges.map((edge) => Number(edge.callCount || 0)), 1),
    [graphEdges]
  );

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

  const handleWheel = useCallback((event) => {
    // Preserve normal page scroll; zoom only with Ctrl/Cmd + wheel.
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    setScale((prev) => Math.min(2.8, Math.max(0.45, prev + (event.deltaY > 0 ? -0.08 : 0.08))));
  }, []);

  const handleMouseMove = (event) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

    if (!dragging) return;
    const dx = (event.clientX - dragStart.x) / scale;
    const dy = (event.clientY - dragStart.y) / scale;
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseDown = (event) => {
    setDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => setDragging(false);

  if (!nodes.length) {
    return <div className="service-graph-empty"><p>No services to display</p></div>;
  }

  return (
    <div ref={containerRef} className={`service-graph-container ${expanded ? 'expanded' : ''}`}>
      <div className="graph-toolbar graph-toolbar-left">
        <button className="graph-toolbar-btn" onClick={zoomOut} title="Zoom Out">-</button>
        <div className="graph-toolbar-zoom">{Math.round(scale * 100)}%</div>
        <button className="graph-toolbar-btn" onClick={zoomIn} title="Zoom In">+</button>
      </div>

      <div className="graph-toolbar graph-toolbar-right">
        <button className="graph-toolbar-btn ghost" onClick={resetView}>Reset View</button>
        <button className="graph-toolbar-btn" onClick={toggleExpand}>{expanded ? 'Exit Expand' : 'Expand'}</button>
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
          <marker id="service-flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#5A6275" />
          </marker>
          <marker id="service-flow-arrow-critical" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#FF4D5A" />
          </marker>
          <filter id="critical-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#FF4D5A" floodOpacity="0.55" />
          </filter>
        </defs>

        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          <g className="stage-label-layer">
            {stageColumns.map((_, stageIndex) => {
              const xCenter = PAD_LEFT + stageIndex * STAGE_GAP_X + NODE_WIDTH / 2;
              return (
                <g key={`stage-${stageIndex}`}>
                  <rect x={xCenter - 46} y={28} width={92} height={24} rx={12} className="stage-pill" />
                  <text x={xCenter} y={44} textAnchor="middle" className="stage-pill-text">
                    {`STAGE ${stageIndex + 1}`}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="edge-layer">
            {graphEdges.map((edge, index) => {
              const source = positions[edge.source];
              const target = positions[edge.target];
              if (!source || !target) return null;

              const startX = source.x + NODE_WIDTH;
              const startY = source.y + NODE_HEIGHT / 2;
              const endX = target.x;
              const endY = target.y + NODE_HEIGHT / 2;
              const isCritical = Number(edge.errorRate || 0) > 5;
              const width = 1.4 + (Number(edge.callCount || 0) / maxCalls) * 2 + (isCritical ? 1.1 : 0);

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
            {nodes.map((node) => {
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
                  <rect x="0" y="0" width={NODE_WIDTH} height={NODE_HEIGHT} rx="13" className="node-card" />
                  <rect x="0" y="10" width="4" height={NODE_HEIGHT - 20} rx="2" className="node-accent" />

                  <text x="16" y="27" className="node-title">{truncate(node.name, 30)}</text>

                  <circle cx="18" cy="48" r="4" fill={severity.color} />
                  <text x="29" y="52" className="node-severity" fill={severity.color}>{severity.label}</text>

                  <rect x="98" y="38" rx="6" width={domainBadgeWidth} height="18" className="node-domain-badge" />
                  <text x={106} y="51" className="node-domain-text">{domain}</text>

                  {alerts > 0 && (
                    <text x={NODE_WIDTH - 16} y="52" textAnchor="end" className="node-alert-text">
                      {`${alerts} ${alerts === 1 ? 'Alert' : 'Alerts'}`}
                    </text>
                  )}

                  <text x="16" y="76" className="node-metric-text">
                    {`Err ${Number(node.errorRate || 0).toFixed(2)}%`}
                  </text>
                  <text x={NODE_WIDTH - 16} y="76" textAnchor="end" className="node-metric-text muted">
                    {`${Number(node.avgLatency || 0).toFixed(0)}ms`}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {hoveredNode && (
        <div className="service-graph-tooltip" style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}>
          <div className="tooltip-header">{hoveredNode.name}</div>
          <div className="tooltip-row"><span className="tooltip-label">Status</span><span className="tooltip-value">{hoveredNode.status || 'unknown'}</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Requests</span><span className="tooltip-value">{Number(hoveredNode.requestCount || 0)}</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Error Rate</span><span className="tooltip-value">{Number(hoveredNode.errorRate || 0).toFixed(2)}%</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Latency</span><span className="tooltip-value">{Number(hoveredNode.avgLatency || 0).toFixed(0)}ms</span></div>
        </div>
      )}

      {hoveredEdge && !hoveredNode && (
        <div className="service-graph-tooltip" style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}>
          <div className="tooltip-header">{`${hoveredEdge.source} -> ${hoveredEdge.target}`}</div>
          <div className="tooltip-row"><span className="tooltip-label">Calls</span><span className="tooltip-value">{Number(hoveredEdge.callCount || 0)}</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Error Rate</span><span className="tooltip-value">{Number(hoveredEdge.errorRate || 0).toFixed(2)}%</span></div>
          <div className="tooltip-row"><span className="tooltip-label">Latency</span><span className="tooltip-value">{Number(hoveredEdge.avgLatency || 0).toFixed(0)}ms</span></div>
        </div>
      )}
    </div>
  );
}
