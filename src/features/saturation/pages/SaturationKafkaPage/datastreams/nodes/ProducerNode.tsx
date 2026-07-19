import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import { fmtRate } from "../model";
import type { ProducerNodeData } from "./types";

export function ProducerNode({ data }: NodeProps) {
  const d = data as ProducerNodeData;
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] border bg-[var(--bg-card)] px-[11px] py-[9px] shadow-[var(--shadow-sm)] transition-[border-color] duration-150"
      style={{ width: 182, minHeight: 56, borderColor: "var(--line)" }}
    >
      <Handle type="source" position={Position.Right} className="!bg-border" />
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand-tint)] text-[var(--brand)]">
        <Server size={13} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono font-semibold text-[12.5px] text-[var(--fg-0)]">
          {d.label}
        </div>
        <div className="text-[11px] text-[var(--fg-3)]">produces · {fmtRate(d.rate)}/s</div>
      </div>
    </div>
  );
}
