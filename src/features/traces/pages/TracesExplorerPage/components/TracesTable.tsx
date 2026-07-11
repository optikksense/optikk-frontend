import type { TraceSummary } from "@shared/api/traces/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

import { TraceRow } from "./TraceRow";
import { TracesTableFooter } from "./TracesTableFooter";

interface Props {
  traces: readonly TraceSummary[];
  onRowClick: (trace: TraceSummary) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function TracesTable({
  traces,
  onRowClick,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
}: Props) {
  const maxDur = useMemo(() => {
    let max = 1;
    for (let i = 0; i < traces.length; i++) {
      const dur = traces[i].duration_ns / 1e6;
      if (dur > max) max = dur;
    }
    return max;
  }, [traces]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: traces.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
      : 0;

  return (
    <div
      className="overflow-hidden bg-card flex flex-col h-full"
      style={{ border: "1px solid var(--line)", borderRadius: 8 }}
    >
      <div
        className="flex flex-row items-center justify-between"
        style={{ padding: "12px 16px", borderBottom: "1px solid var(--line-2)" }}
      >
        <div className="font-semibold text-[12px] text-foreground-muted uppercase tracking-[0.06em]">
          Results
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-card font-semibold text-[11.5px] text-foreground-muted uppercase tracking-[0.06em]">
            <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
              <th className="py-2.5 pl-[18px]">
                <div className="resize-x overflow-hidden whitespace-nowrap" style={{ width: 110 }}>
                  Time
                </div>
              </th>
              <th className="py-2.5">
                <div
                  className="resize-x overflow-hidden whitespace-nowrap"
                  style={{ minWidth: 150 }}
                >
                  Operation
                </div>
              </th>
              <th className="py-2.5 text-right">
                <div
                  className="ml-auto resize-x overflow-hidden whitespace-nowrap"
                  style={{ width: 90 }}
                >
                  Duration
                </div>
              </th>
              <th className="px-3 py-2.5">
                <div
                  className="resize-x overflow-hidden whitespace-nowrap"
                  style={{ minWidth: 150, width: "100%" }}
                >
                  Latency bar
                </div>
              </th>
              <th className="py-2.5">
                <div className="resize-x overflow-hidden whitespace-nowrap" style={{ width: 80 }}>
                  Status
                </div>
              </th>
              <th className="py-2.5 text-right">
                <div
                  className="ml-auto resize-x overflow-hidden whitespace-nowrap"
                  style={{ width: 56 }}
                >
                  Spans
                </div>
              </th>
              <th className="w-[18px] py-2.5" />
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualItems.map((virtualRow) => {
              const t = traces[virtualRow.index];
              return <TraceRow key={t.trace_id} t={t} maxDur={maxDur} onRowClick={onRowClick} />;
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TracesTableFooter
        rowCount={traces.length}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
