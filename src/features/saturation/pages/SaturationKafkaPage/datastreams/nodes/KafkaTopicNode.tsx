import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Layers } from "lucide-react";
import { fmtRate } from "../model";
import { LV_COLOR, type TopicNodeData } from "./types";

export function KafkaTopicNode({ data }: NodeProps) {
  const d = data as TopicNodeData;
  const accent =
    d.level === "err"
      ? "color-mix(in oklab, var(--err) 45%, var(--line))"
      : d.level === "warn"
        ? "color-mix(in oklab, var(--warn) 45%, var(--line))"
        : "var(--line)";
  return (
    <div
      className="flex items-start justify-between rounded-[10px] border bg-[var(--bg-card)] px-[11px] py-[9px] shadow-[var(--shadow-sm)]"
      style={{ width: 212, minHeight: 56, borderColor: accent }}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]">
          <Layers size={13} />
        </span>
        <div className="min-w-0">
          <div className="max-w-[150px] truncate font-mono font-semibold text-[12.5px] text-[var(--fg-0)]">
            {d.label}
          </div>
          <div className="text-[11px] text-[var(--fg-3)]">
            {d.producerCount}p · {d.consumerGroupCount}g · {fmtRate(d.rate)}/s
          </div>
        </div>
      </div>
      <span
        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: LV_COLOR[d.level] }}
      />
    </div>
  );
}
