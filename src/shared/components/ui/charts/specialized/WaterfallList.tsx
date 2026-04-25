import type { RefObject } from "react";
import { memo } from "react";
import type { useVirtualizer } from "@tanstack/react-virtual";

import { WaterfallRow } from "./WaterfallRow";
import type { WaterfallSpan, WaterfallTreeSpan } from "./waterfallTypes";

type Virtualizer = any;

export interface WaterfallListProps {
  readonly parentRef: RefObject<HTMLDivElement | null>;
  readonly virtualizer: Virtualizer;
  readonly visibleTree: readonly WaterfallTreeSpan[];
  readonly selectedSpanId?: string | null;
  readonly criticalPathSpanIds?: Set<string>;
  readonly errorPathSpanIds?: Set<string>;
  readonly hitSpanId: string | null;
  readonly collapsed: ReadonlySet<string>;
  readonly onSpanClick?: (span: WaterfallSpan) => void;
  readonly onToggleCollapse?: (spanId: string) => void;
}

/** Virtualized row list. Extracted from WaterfallChart to keep that orchestrator small. */
function WaterfallListComponent(p: WaterfallListProps) {
  return (
    <div
      ref={p.parentRef}
      className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-track]:bg-[var(--scrollbar-track)] [&::-webkit-scrollbar]:w-2"
    >
      <div style={{ height: `${p.virtualizer.getTotalSize()}px`, position: "relative" }}>
        {p.virtualizer.getVirtualItems().map((vItem) => {
          const span = p.visibleTree[vItem.index];
          return (
            <div
              key={span.span_id}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vItem.start}px)` }}
            >
              <WaterfallRow
                span={span}
                isSelected={p.selectedSpanId === span.span_id}
                isCritical={p.criticalPathSpanIds?.has(span.span_id) ?? false}
                isError={p.errorPathSpanIds?.has(span.span_id) ?? false}
                isHit={p.hitSpanId === span.span_id}
                isCollapsed={p.collapsed.has(span.span_id)}
                onSpanClick={p.onSpanClick}
                onToggleCollapse={p.onToggleCollapse}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const WaterfallList = memo(WaterfallListComponent);
