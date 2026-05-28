import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { TraceRecord } from "@shared/entities/trace/model";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly onSelect: (span: { span_id: string }) => void;
}

function ErrorsTabComponent({ spans, onSelect }: Props) {
  const errs = useMemo(
    () => spans.filter((s) => (s.status ?? "").toUpperCase() === "ERROR"),
    [spans]
  );

  if (errs.length === 0) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center gap-1.5">
        <div className="text-[18px] text-[var(--text-primary)] font-semibold">
          No errored spans
        </div>
        <div className="text-[13px] text-[var(--text-muted)] max-w-[480px]">
          Every span in this trace finished with a non-error status.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-2.5 overflow-auto">
      <div className="text-[12px] text-[var(--text-caption)] uppercase tracking-[0.06em]">
        {errs.length} error span{errs.length === 1 ? "" : "s"} in this trace
      </div>
      {errs.map((s) => (
        <button
          key={s.span_id}
          type="button"
          className="bg-[var(--bg-secondary)] border border-[var(--color-error-subtle)] rounded-[10px] p-3 cursor-pointer text-left hover:bg-[var(--bg-tertiary)]"
          onClick={() => onSelect({ span_id: s.span_id })}
        >
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-full text-[10.5px] font-mono bg-[var(--color-error-subtle)] text-[var(--color-error)]">
              <AlertCircle size={11} /> error
            </span>
            <span className="text-[var(--text-muted)] text-[12px]">{s.service_name}</span>
            <span className="text-[var(--text-primary)] font-mono text-[12.5px]">
              {s.operation_name}
            </span>
            <span className="ml-auto text-[var(--text-muted)] font-mono">
              {formatDuration(s.duration_ms ?? 0)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div>
                <div className="text-[11px] text-[var(--text-caption)]">span kind</div>
                <div className="text-[12px] text-[var(--text-primary)] font-mono break-words">
                  {s.span_kind || "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-caption)]">http.status</div>
                <div className="text-[12px] text-[var(--text-primary)] font-mono break-words">
                  {s.http_status_code ?? "—"}
                </div>
              </div>
              {s.http_method && (
                <div>
                  <div className="text-[11px] text-[var(--text-caption)]">http.method</div>
                  <div className="text-[12px] text-[var(--text-primary)] font-mono break-words">
                    {s.http_method}
                  </div>
                </div>
              )}
              {s.status_message && (
                <div>
                  <div className="text-[11px] text-[var(--text-caption)]">status_message</div>
                  <div className="text-[12px] text-[var(--text-primary)] font-mono break-words">
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
