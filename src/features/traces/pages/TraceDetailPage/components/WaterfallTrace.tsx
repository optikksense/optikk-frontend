import type { TraceRecord } from "@shared/entities/trace/model";
import { cn } from "@shared/lib/utils";
import { formatDuration } from "@shared/utils/formatters";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { SpanEvent } from "../../../types";
import {
  type BarEvent,
  buildFlatTree,
  eventLevel,
  matchesQuery,
  niceStep,
} from "../../../utils/traceTransformers";
import { WaterfallTraceRow, lblBase, wfGrid } from "./WaterfallTraceRow";

const ROW_HEIGHT = 28;

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { span_id: string }) => void;
  readonly criticalPathSpanIds: ReadonlySet<string>;
  readonly errorPathSpanIds: ReadonlySet<string>;
  readonly search: string;
  readonly spanEvents?: readonly SpanEvent[];
}

function WaterfallTraceComponent({
  spans,
  selectedSpanId,
  onSpanClick,
  criticalPathSpanIds,
  errorPathSpanIds,
  search,
  spanEvents,
}: Props) {
  const eventsBySpan = useMemo(() => {
    const m = new Map<string, BarEvent[]>();
    if (!spanEvents?.length) return m;
    for (const e of spanEvents) {
      const tMs = e.timestamp ? new Date(e.timestamp).getTime() : Number.NaN;
      if (!Number.isFinite(tMs)) continue;
      const arr = m.get(e.spanId);
      const item: BarEvent = { level: eventLevel(e.eventName), tMs, name: e.eventName };
      if (arr) arr.push(item);
      else m.set(e.spanId, [item]);
    }
    return m;
  }, [spanEvents]);

  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { flat, traceStartMs, traceEndMs } = useMemo(
    () => buildFlatTree(spans, collapsed),
    [spans, collapsed]
  );
  const totalMs = Math.max(0, traceEndMs - traceStartMs);

  const ticks = useMemo(() => {
    if (totalMs <= 0) return [] as { t: number; pct: number }[];
    const step = niceStep(totalMs / 8);
    const out: { t: number; pct: number }[] = [];
    for (let t = 0; t <= totalMs; t += step) {
      out.push({ t, pct: (t / totalMs) * 100 });
    }
    return out;
  }, [totalMs]);

  const showCritDot = criticalPathSpanIds.size > 0;

  // Virtualization
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: flat.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className={cn(wfGrid, "sticky top-0 z-[5] border-border border-b bg-background")}>
        <div
          className={cn(
            lblBase,
            "!text-[10.5px] h-[34px] text-foreground-caption uppercase tracking-[0.06em]"
          )}
        >
          Service · Operation
        </div>
        <div className="relative h-[34px]">
          <div className="relative h-full">
            {ticks.map(({ t, pct }) => (
              <div key={t} className="absolute top-0 bottom-0" style={{ left: `${pct}%` }}>
                <div className="absolute top-2 bottom-2 w-px bg-border" />
                <div
                  className={cn(
                    "-translate-x-1/2 absolute bottom-[5px] whitespace-nowrap bg-background px-[3px] font-mono text-[10px] text-foreground-caption [font-variant-numeric:tabular-nums]",
                    pct < 4 && "!left-0 !translate-x-0",
                    pct > 96 && "!-translate-x-full"
                  )}
                >
                  {formatDuration(t)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto">
        <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = flat[virtualRow.index];
            return (
              <div
                key={row.span.span_id}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <WaterfallTraceRow
                  row={row}
                  selectedSpanId={selectedSpanId}
                  traceStartMs={traceStartMs}
                  totalMs={totalMs}
                  isCrit={showCritDot && criticalPathSpanIds.has(row.span.span_id)}
                  isErrPath={errorPathSpanIds.has(row.span.span_id)}
                  dim={!matchesQuery(row.span, search)}
                  collapsed={collapsed.has(row.span.span_id)}
                  events={eventsBySpan.get(row.span.span_id)}
                  onClick={() => onSpanClick({ span_id: row.span.span_id })}
                  onToggle={() => toggle(row.span.span_id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 border-border border-t bg-background px-4 py-2.5 text-[11px] text-foreground-caption">
        <span>
          Showing {flat.length} of {spans.length} span{spans.length === 1 ? "" : "s"}
        </span>
        <span>View: 0 – {formatDuration(totalMs)}</span>
        <span>Click a row to inspect · use the search box above to filter</span>
      </div>
    </div>
  );
}

export const WaterfallTrace = memo(WaterfallTraceComponent);
