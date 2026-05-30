import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { TraceErrorGroup } from "@shared/api/schemas/tracesSchemas";
import type { TraceRecord } from "@shared/entities/trace/model";

import { TraceErrorSummary } from "./TraceErrorSummary";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly onSelect: (span: { span_id: string }) => void;
  readonly errorGroups?: readonly TraceErrorGroup[];
}

function ErrorsTabComponent({ spans, onSelect, errorGroups }: Props) {
  const errs = useMemo(
    () => spans.filter((s) => (s.status ?? "").toUpperCase() === "ERROR"),
    [spans]
  );
  const groups = errorGroups ?? [];

  if (errs.length === 0 && groups.length === 0) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center gap-1.5">
        <div className="text-[18px] text-foreground font-semibold">
          No errored spans
        </div>
        <div className="text-[13px] text-foreground-muted max-w-[480px]">
          Every span in this trace finished with a non-error status.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-2.5 overflow-auto">
      {groups.length > 0 && <TraceErrorSummary groups={groups} onSpanClick={onSelect} />}
      {errs.length > 0 && (
        <div className="text-[12px] text-foreground-caption uppercase tracking-[0.06em]">
          {errs.length} error span{errs.length === 1 ? "" : "s"} in this trace
        </div>
      )}
      {errs.map((s) => (
        <button
          key={s.span_id}
          type="button"
          className="bg-secondary border border-error-subtle rounded-[10px] p-3 cursor-pointer text-left hover:bg-muted"
          onClick={() => onSelect({ span_id: s.span_id })}
        >
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-full text-[10.5px] font-mono bg-error-subtle text-error">
              <AlertCircle size={11} /> error
            </span>
            <span className="text-foreground-muted text-[12px]">{s.service_name}</span>
            <span className="text-foreground font-mono text-[12.5px]">
              {s.operation_name}
            </span>
            <span className="ml-auto text-foreground-muted font-mono">
              {formatDuration(s.duration_ms ?? 0)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div>
                <div className="text-[11px] text-foreground-caption">span kind</div>
                <div className="text-[12px] text-foreground font-mono break-words">
                  {s.span_kind || "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-foreground-caption">http.status</div>
                <div className="text-[12px] text-foreground font-mono break-words">
                  {s.http_status_code ?? "—"}
                </div>
              </div>
              {s.http_method && (
                <div>
                  <div className="text-[11px] text-foreground-caption">http.method</div>
                  <div className="text-[12px] text-foreground font-mono break-words">
                    {s.http_method}
                  </div>
                </div>
              )}
              {s.status_message && (
                <div>
                  <div className="text-[11px] text-foreground-caption">status_message</div>
                  <div className="text-[12px] text-foreground font-mono break-words">
                    {s.status_message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export const ErrorsTab = memo(ErrorsTabComponent);
