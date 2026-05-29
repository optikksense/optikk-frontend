import { AlertCircle, Flame } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import { formatDuration } from "@shared/utils/formatters";

import { getServiceColor } from "../../../utils/serviceColor";
import type { HotSpan } from "../../../utils/hotSpans";

interface Props {
  readonly hotSpans: readonly HotSpan[];
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { span_id: string }) => void;
}

const labelK =
  "text-[10.5px] tracking-[0.06em] uppercase text-[var(--text-caption)] whitespace-nowrap inline-flex items-center gap-1";

/**
 * Top-3 spans by self-time — the spans where the trace actually spends wall
 * time. Clicking a chip opens that span in the detail drawer. Rendered in the
 * summary strip so the slowest work is one glance and one click away.
 */
function HotSpansStripComponent({ hotSpans, selectedSpanId, onSpanClick }: Props) {
  if (hotSpans.length === 0) return null;

  return (
    <div className="flex items-center gap-3.5 px-5 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] overflow-x-auto">
      <span className={labelK}>
        <Flame size={11} className="text-[var(--color-degraded)]" /> Hot spans
      </span>
      <div className="flex gap-1.5 flex-1 flex-wrap">
        {hotSpans.map((s, i) => {
          const isActive = selectedSpanId === s.spanId;
          return (
            <button
              key={s.spanId}
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 pr-[9px] pl-1.5 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] whitespace-nowrap cursor-pointer flex-none hover:bg-[var(--bg-hover)]",
                isActive &&
                  "border-[var(--color-primary)] bg-[var(--color-primary-subtle-15)] text-[var(--text-primary)]",
                s.hasError && "shadow-[inset_0_0_0_1px_var(--color-error-subtle)]"
              )}
              onClick={() => onSpanClick({ span_id: s.spanId })}
              title={`${s.service} · ${s.operation} · self ${formatDuration(s.selfTimeMs)} (${s.pctOfTrace.toFixed(0)}% of trace self-time)`}
            >
              <span className="font-mono text-[10.5px] text-[var(--text-caption)]">#{i + 1}</span>
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: getServiceColor(s.service) }}
              />
              <span className="max-w-[180px] truncate">{s.operation}</span>
              <span className="font-mono text-[11px] text-[var(--text-primary)]">
                {formatDuration(s.selfTimeMs)}
              </span>
              {s.hasError && (
                <span className="text-[var(--color-error)] inline-flex items-center" aria-hidden>
                  <AlertCircle size={11} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const HotSpansStrip = memo(HotSpansStripComponent);
