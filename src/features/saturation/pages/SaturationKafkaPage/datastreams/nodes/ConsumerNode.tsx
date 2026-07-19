import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import { fmtRate } from "../model";
import { type ConsumerNodeData, LV_COLOR } from "./types";

export function ConsumerNode({ data }: NodeProps) {
  const d = data as ConsumerNodeData;
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] border bg-[var(--bg-card)] px-[11px] py-[9px] shadow-[var(--shadow-sm)] transition-[border-color] duration-150"
      style={{
        width: 182,
        minHeight: 56,
        borderColor:
          d.level === "err" ? "color-mix(in oklab, var(--err) 45%, var(--line))" : "var(--line)",
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand-tint)] text-[var(--brand)]">
        <Server size={13} />
        <span
          className="absolute right-[-2px] bottom-[-2px] h-2 w-2 rounded-full border-[1.5px] border-[var(--bg-card)]"
          style={{ background: LV_COLOR[d.level] }}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono font-semibold text-[12.5px] text-[var(--fg-0)]">
          {d.label}
        </div>
        <div className="text-[11px] text-[var(--fg-3)]">
          consumes {d.topicCount} · {fmtRate(d.rate)}/s
        </div>
      </div>
    </div>
  );
}
