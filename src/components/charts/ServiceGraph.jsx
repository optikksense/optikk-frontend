import React, { useState, useRef, useMemo, useCallback } from 'react';
import './ServiceGraph.css';

const ServiceGraph = ({ nodes = [], edges = [], onNodeClick }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 600;
  const NODE_RADIUS = 35;

  // Force-directed layout
  const nodePositions = useMemo(() => {
    if (nodes.length === 0) return {};
    if (nodes.length === 1) {
      return { [nodes[0].name]: { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 } };
    }

    // Initialize positions in a circle
    const positions = {};
    const radius = Math.min(SVG_WIDTH, SVG_HEIGHT) * 0.3;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      positions[node.name] = {
        x: SVG_WIDTH / 2 + radius * Math.cos(angle),
        y: SVG_HEIGHT / 2 + radius * Math.sin(angle),
      };
    });

    // Build adjacency for attractive forces
    const edgeSet = edges.map((e) => [e.source, e.target]);

    // Spring-embedder iterations
    const ITERATIONS = 80;
    const REPULSION = 8000;
    const ATTRACTION = 0.005;
    const DAMPING = 0.9;
    const MIN_DIST = 80;

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const forces = {};
      nodes.forEach((n) => { forces[n.name] = { x: 0, y: 0 }; });

      // Repulsive forces between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = positions[nodes[i].name];
          const b = positions[nodes[j].name];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST);
          const force = REPULSION / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          forces[nodes[i].name].x += fx;
          forces[nodes[i].name].y += fy;
          forces[nodes[j].name].x -= fx;
          forces[nodes[j].name].y -= fy;
        }
      }

      // Attractive forces along edges
      edgeSet.forEach(([src, tgt]) => {
        if (!positions[src] || !positions[tgt]) return;
        const a = positions[src];
        const b = positions[tgt];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return;
        const force = dist * ATTRACTION;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        forces[src].x += fx;
        forces[src].y += fy;
        forces[tgt].x -= fx;
        forces[tgt].y -= fy;
      });

      // Center gravity
      nodes.forEach((n) => {
        const p = positions[n.name];
        forces[n.name].x += (SVG_WIDTH / 2 - p.x) * 0.001;
        forces[n.name].y += (SVG_HEIGHT / 2 - p.y) * 0.001;
      });

      // Apply forces
      const temp = 1 - iter / ITERATIONS;
      nodes.forEach((n) => {
        positions[n.name].x += forces[n.name].x * DAMPING * temp;
        positions[n.name].y += forces[n.name].y * DAMPING * temp;
        // Keep within bounds
        positions[n.name].x = Math.max(NODE_RADIUS + 20, Math.min(SVG_WIDTH - NODE_RADIUS - 20, positions[n.name].x));
        positions[n.name].y = Math.max(NODE_RADIUS + 20, Math.min(SVG_HEIGHT - NODE_RADIUS - 20, positions[n.name].y));
      });
    }

    return positions;
  }, [nodes, edges]);

  const getNodeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return '#73C991';
      case 'degraded': return '#F79009';
      case 'unhealthy': return '#F04438';
      default: return '#6B7280';
    }
  };

  const getEdgeColor = (errorRate) => errorRate > 5 ? '#F04438' : '#555555';

  const getEdgeWidth = (callCount) => {
    const maxCalls = Math.max(...edges.map(e => e.callCount || 0), 1);
    return 1 + ((callCount || 0) / maxCalls) * 3;
  };

  const createEdgePath = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const offset = dr * 0.15;
    const perpX = -dy / dr;
    const perpY = dx / dr;
    return `M ${x1} ${y1} Q ${midX + perpX * offset} ${midY + perpY * offset} ${x2} ${y2}`;
  };

  const handleMouseMove = (e) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (dragging) {
      setTranslate((prev) => ({
        x: prev.x + (e.clientX - dragStart.x) / scale,
        y: prev.y + (e.clientY - dragStart.y) / scale,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale((prev) => Math.min(3, Math.max(0.3, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.node')) return;
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setDragging(false);

  const zoomIn = () => setScale((prev) => Math.min(3, prev + 0.2));
  const zoomOut = () => setScale((prev) => Math.max(0.3, prev - 0.2));
  const resetView = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  if (nodes.length === 0) {
    return <div className="service-graph-empty"><p>No services to display</p></div>;
  }

  return (
    <div className="service-graph-container">
      {/* Zoom Controls */}
      <div className="graph-controls">
        <button onClick={zoomIn} className="graph-control-btn" title="Zoom In">+</button>
        <button onClick={zoomOut} className="graph-control-btn" title="Zoom Out">−</button>
        <button onClick={resetView} className="graph-control-btn" title="Reset">⟲</button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="service-graph-svg"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#555555" />
          </marker>
          <marker id="arrowhead-error" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#F04438" />
          </marker>
        </defs>

        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          {/* Edges */}
          <g className="edges">
            {edges.map((edge, index) => {
              const sourcePos = nodePositions[edge.source];
              const targetPos = nodePositions[edge.target];
              if (!sourcePos || !targetPos) return null;

              const errorRate = edge.errorRate || 0;
              const isError = errorRate > 5;
              const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
              const x1 = sourcePos.x + NODE_RADIUS * Math.cos(angle);
              const y1 = sourcePos.y + NODE_RADIUS * Math.sin(angle);
              const x2 = targetPos.x - NODE_RADIUS * Math.cos(angle);
              const y2 = targetPos.y - NODE_RADIUS * Math.sin(angle);
              const path = createEdgePath(x1, y1, x2, y2);
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g
                  key={`edge-${index}`}
                  className="edge"
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  <path
                    d={path}
                    stroke={getEdgeColor(errorRate)}
                    strokeWidth={getEdgeWidth(edge.callCount)}
                    opacity={0.6}
                    fill="none"
                    markerEnd={`url(#${isError ? 'arrowhead-error' : 'arrowhead'})`}
                    className="edge-path edge-flow"
                    strokeDasharray="8 4"
                  />
                  {edge.callCount && (
                    <text x={midX} y={midY - 5} className="edge-label" textAnchor="middle">
                      {edge.callCount}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const pos = nodePositions[node.name];
              if (!pos) return null;
              const color = getNodeColor(node.status);

              return (
                <g
                  key={node.name}
                  className="node"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNodeClick && onNodeClick(node)}
                  style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                >
                  {/* Pulse ring for unhealthy */}
                  {node.status?.toLowerCase() === 'unhealthy' && (
                    <circle r={NODE_RADIUS + 4} fill="none" stroke={color} strokeWidth={2} className="node-pulse" />
                  )}
                  <circle
                    r={NODE_RADIUS}
                    fill={color}
                    stroke={hoveredNode?.name === node.name ? '#fff' : 'none'}
                    strokeWidth={hoveredNode?.name === node.name ? 3 : 0}
                    className="node-circle"
                  />
                  <text y={5} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                    {node.requestCount || 0}
                  </text>
                  <text y={NODE_RADIUS + 20} textAnchor="middle" fill="#E5E7EB" fontSize="14" fontWeight="500">
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Tooltips */}
      {hoveredNode && (
        <div className="service-graph-tooltip" style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}>
          <div className="tooltip-header">{hoveredNode.name}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Status:</span>
            <span className={`tooltip-value status-${hoveredNode.status?.toLowerCase()}`}>{hoveredNode.status || 'Unknown'}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Requests:</span>
            <span className="tooltip-value">{hoveredNode.requestCount || 0}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Error Rate:</span>
            <span className="tooltip-value">{hoveredNode.errorRate?.toFixed(2) || 0}%</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Avg Latency:</span>
            <span className="tooltip-value">{hoveredNode.avgLatency?.toFixed(0) || 0}ms</span>
          </div>
        </div>
      )}

      {hoveredEdge && !hoveredNode && (
        <div className="service-graph-tooltip" style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}>
          <div className="tooltip-header">{hoveredEdge.source} → {hoveredEdge.target}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Call Count:</span>
            <span className="tooltip-value">{hoveredEdge.callCount || 0}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Avg Latency:</span>
            <span className="tooltip-value">{hoveredEdge.avgLatency?.toFixed(0) || 0}ms</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Error Rate:</span>
            <span className="tooltip-value">{hoveredEdge.errorRate?.toFixed(2) || 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceGraph;
