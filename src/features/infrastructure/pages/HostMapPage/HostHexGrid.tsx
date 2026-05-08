import { useMemo } from "react";

import type { InfrastructureNode } from "../../api/hostsApi";

type ColorKey = "cpu" | "errors" | "latency";

interface Props {
  readonly nodes: readonly InfrastructureNode[];
  readonly colorBy: ColorKey;
  readonly onSelect: (host: string) => void;
}

function colorForNode(node: InfrastructureNode, by: ColorKey): string {
  if (by === "errors") {
    if (node.error_rate >= 0.05) return "#ef4444";
    if (node.error_rate >= 0.01) return "#f59e0b";
    return "#10b981";
  }
  if (by === "latency") {
    if (node.p95_latency_ms >= 1000) return "#ef4444";
    if (node.p95_latency_ms >= 250) return "#f59e0b";
    return "#10b981";
  }
  // cpu = simple proxy: higher request_count = warmer
  if (node.request_count >= 100_000) return "#f59e0b";
  if (node.request_count >= 10_000) return "#3b82f6";
  return "#6366f1";
}

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

export function HostHexGrid({ nodes, colorBy, onSelect }: Props) {
  const sorted = useMemo(
    () => [...nodes].sort((a, b) => b.request_count - a.request_count),
    [nodes]
  );

  if (sorted.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">
        No hosts in this window.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-2 md:grid-cols-10 xl:grid-cols-16">
      {sorted.map((node) => (
        <button
          key={node.host}
          type="button"
          onClick={() => onSelect(node.host)}
          title={`${node.host}\n${node.request_count.toLocaleString()} req · ${(node.error_rate * 100).toFixed(2)}% err · p95 ${fmtMs(node.p95_latency_ms)}`}
          style={{
            background: colorForNode(node, colorBy),
            aspectRatio: "1 / 1",
          }}
          className="cursor-pointer rounded-md border border-black/20 transition-transform hover:scale-105"
        />
      ))}
    </div>
  );
}
