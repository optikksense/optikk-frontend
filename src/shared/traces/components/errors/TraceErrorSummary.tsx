import type { TraceErrorGroup } from "@shared/api/traces/schemas";
import { AlertCircle } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly groups: readonly TraceErrorGroup[];
  readonly onSpanClick: (span: { spanId: string }) => void;
}

function TraceErrorSummaryComponent({ groups, onSpanClick }: Props) {
  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-error-subtle/50 bg-error-subtle/10 p-4">
      <div className="flex items-center gap-2 font-semibold text-[13px] text-error">
        <AlertCircle size={15} /> Exception Summary ({groups.length} group
        {groups.length === 1 ? "" : "s"})
      </div>

      <div className="flex flex-col gap-2">
        {groups.map((g, i) => (
          <div key={`${g.exceptionType}-${i}`} className="flex flex-col gap-1 text-[12px]">
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-foreground">
                {g.exceptionType || "Exception"}
              </span>
              <span className="text-[11px] text-foreground-caption">{g.count} occurrences</span>
            </div>

            {g.spans.map((sp) => (
              <button
                key={sp.spanId}
                type="button"
                className="flex cursor-pointer items-center justify-between rounded bg-background p-2 text-left font-mono text-[11.5px] hover:bg-muted"
                onClick={() => onSpanClick({ spanId: sp.spanId })}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-foreground-muted">{sp.serviceName}</span>
                  <span className="text-foreground">{sp.operationName}</span>
                </div>
                {sp.exceptionMessage && (
                  <span className="max-w-[240px] truncate text-[11px] text-error">
                    {sp.exceptionMessage}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TraceErrorSummary = memo(TraceErrorSummaryComponent);
