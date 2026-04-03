import { useState, useCallback, useRef } from 'react';

export function useTopologyInteractions() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{ source: string; target: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => setScale((s) => Math.min(3, s + 0.15)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.3, s - 0.15)), []);
  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setScale((s) => Math.min(3, Math.max(0.3, s + (e.deltaY > 0 ? -0.08 : 0.08))));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        const dx = (e.clientX - dragStart.current.x) / scale;
        const dy = (e.clientY - dragStart.current.y) / scale;
        setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    },
    [dragging, scale]
  );

  const handleMouseUp = useCallback(() => setDragging(false), []);

  return {
    selectedNode,
    setSelectedNode,
    hoveredNode,
    setHoveredNode,
    hoveredEdge,
    setHoveredEdge,
    tooltipPos,
    setTooltipPos,
    scale,
    translate,
    dragging,
    zoomIn,
    zoomOut,
    resetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
