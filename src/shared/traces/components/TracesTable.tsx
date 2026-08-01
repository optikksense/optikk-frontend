import type { TraceSummary } from "@shared/api/traces/types";
import { useMemo } from "react";

import { ExplorerTableFooter } from "@shared/search/components/chrome/ExplorerTableFooter";
import { TraceRow } from "./TraceRow";

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
      const dur = traces[i].durationMs;
      if (dur > max) max = dur;
    }
    return max;
  }, [traces]);

  return (
    <div
      className="flex flex-col bg-card"
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

      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-card font-semibold text-[11.5px] text-foreground-muted uppercase tracking-[0.06em]">
          <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
            <th className="py-2.5 pl-[18px]">
              <div className="resize-x overflow-hidden whitespace-nowrap" style={{ width: 110 }}>
                Time
              </div>
            </th>
            <th className="py-2.5">
              <div className="resize-x overflow-hidden whitespace-nowrap" style={{ minWidth: 150 }}>
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
          {traces.map((t) => (
            <TraceRow key={t.traceId} t={t} maxDur={maxDur} onRowClick={onRowClick} />
          ))}
        </tbody>
      </table>

      <ExplorerTableFooter
        rowCount={traces.length}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
