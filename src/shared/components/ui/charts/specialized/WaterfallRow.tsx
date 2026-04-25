import { ChevronDown, ChevronRight } from "lucide-react";
import { memo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { WaterfallSpan, WaterfallTreeSpan } from "./waterfallTypes";

const KIND_COLORS: Record<string, string> = {
  SERVER: "#648FFF",
  CLIENT: "#785EF0",
  INTERNAL: "#6b7280",
  PRODUCER: "#06aed5",
  CONSUMER: "#73c991",
};

function kindColor(kind: string): string {
  return KIND_COLORS[(kind ?? "").toUpperCase()] ?? "#9ca3af";
}

export interface WaterfallRowProps {
  readonly span: WaterfallTreeSpan;
  readonly isSelected: boolean;
  readonly isCritical: boolean;
  readonly isError: boolean;
  readonly isHit: boolean;
  readonly isCollapsed: boolean;
  readonly onSpanClick?: (s: WaterfallSpan) => void;
  readonly onToggleCollapse?: (spanId: string) => void;
}

function WaterfallRowComponent(p: WaterfallRowProps) {
  const { span, isSelected, isCritical, isError, isHit, isCollapsed, onSpanClick, onToggleCollapse } = p;
  const kind = ((span.kind_string || span.span_kind) ?? "").toUpperCase();
  const { borderLeft, rowBg } = rowBgStyles(isSelected, isError, isCritical, isHit);
  const bg = span.barColor.startsWith("#")
    ? `linear-gradient(90deg, ${span.barColor}, ${span.barColor}dd)`
    : span.barColor;
  return (
    <div
      className="flex h-[56px] cursor-pointer border-[var(--glass-border)] border-b transition-[background-color] duration-150 hover:bg-[rgba(255,255,255,0.04)]"
      style={{ borderLeft, background: rowBg }}
      onClick={() => onSpanClick?.(span)}
    >
      <RowLabel span={span} kind={kind} isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      <div className="flex w-[60px] min-w-[60px] items-center justify-end border-[var(--glass-border)] border-r px-2 text-[11px] text-[var(--text-muted)] tabular-nums">
        {span.durationPct}%
      </div>
      <div className="relative flex-1 py-3">
        <div className="relative h-full">
          <div
            className="absolute flex h-6 min-w-[3px] animate-[waterfall-bar-enter_0.4s_ease-out_forwards] cursor-pointer items-center justify-start rounded px-1.5 opacity-0 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)] transition-[opacity,transform,box-shadow] duration-200 hover:z-[5] hover:scale-y-[1.15] hover:opacity-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            style={{ left: `${span.leftPct}%`, width: `${Math.max(span.widthPct, 0.5)}%`, background: bg }}
            title={`${span.operation_name} — ${formatDuration(span.duration_ms)}`}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[10px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
              {formatDuration(span.duration_ms)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RowLabel({
  span,
  kind,
  isCollapsed,
  onToggleCollapse,
}: {
  span: WaterfallTreeSpan;
  kind: string;
  isCollapsed: boolean;
  onToggleCollapse?: (spanId: string) => void;
}) {
  const Chevron = isCollapsed ? ChevronRight : ChevronDown;
  return (
    <div className="w-[300px] min-w-[300px] border-[var(--glass-border)] border-r">
      <div className="flex flex-col gap-0.5 py-2" style={{ paddingLeft: `${span.depth * 16 + 8}px` }}>
        <div className="flex items-center gap-1">
          {span.childCount > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse?.(span.span_id);
              }}
              className="flex h-3 w-3 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Chevron size={12} />
            </button>
          ) : (
            <span className="inline-block h-3 w-3" />
          )}
          {kind ? (
            <span
              className="flex-shrink-0 rounded-[3px] px-1 py-px font-bold text-[9px] leading-[14px] tracking-[0.04em]"
              style={{ background: `${kindColor(kind)}22`, color: kindColor(kind) }}
            >
              {kind.slice(0, 3)}
            </span>
          ) : null}
          <span className="font-medium text-[11px] text-[var(--text-muted)] uppercase tracking-[0.3px]">
            {span.service_name}
          </span>
        </div>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap font-normal text-[13px] text-[var(--text-primary)]">
          {span.operation_name}
        </span>
      </div>
    </div>
  );
}

function rowBgStyles(isSelected: boolean, isError: boolean, isCritical: boolean, isHit: boolean) {
  if (isSelected) return { borderLeft: "3px solid var(--literal-hex-5e60ce)", rowBg: "var(--literal-rgba-94-96-206-0p15)" };
  if (isError) return { borderLeft: "3px solid #f04438", rowBg: "rgba(240,68,56,0.06)" };
  if (isCritical) return { borderLeft: "3px solid #f59e0b", rowBg: "rgba(245,158,11,0.06)" };
  if (isHit) return { borderLeft: "3px solid #06aed5", rowBg: "rgba(6,174,213,0.08)" };
  return { borderLeft: "none", rowBg: "transparent" };
}

export const WaterfallRow = memo(WaterfallRowComponent);
