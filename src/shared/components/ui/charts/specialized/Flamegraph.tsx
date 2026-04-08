import type { FlamegraphNode } from "@features/traces/types";
import { useEffect, useRef } from "react";
import { useMeasure } from "react-use";

interface FlamegraphProps {
  data: FlamegraphNode;
  onNodeClick?: (node: FlamegraphNode) => void;
  height?: number;
}

export default function Flamegraph({ data, onNodeClick, height = 400 }: FlamegraphProps) {
  const [containerRef, dimensions] = useMeasure<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const drawNode = (node: FlamegraphNode, x: number, y: number, width: number, depth: number) => {
      if (width < 1) return;

      const nodeHeight = 24;
      const padding = 1;

      // Color based on name or depth
      const hue = (depth * 40) % 360;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.7)`;
      ctx.fillRect(x, y, width - padding, nodeHeight - padding);

      // Label
      if (width > 30) {
        ctx.fillStyle = "#fff";
        ctx.font = "10px Inter, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(node.name, x + 4, y + nodeHeight / 2, width - 8);
      }

      if (node.children) {
        let childX = x;
        const totalValue = node.children.reduce((acc, child) => acc + child.value, 0);

        node.children.forEach((child) => {
          const childWidth = (child.value / node.value) * width;
          drawNode(child, childX, y + nodeHeight, childWidth, depth + 1);
          childX += childWidth;
        });
      }
    };

    ctx.clearRect(0, 0, dimensions.width * dpr, height * dpr);
    drawNode(data, 0, 20, dimensions.width, 0);
  }, [data, dimensions, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        background: "var(--glass-bg)",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--glass-border)",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", cursor: "pointer" }} />
    </div>
  );
}
