import { AlertTriangle, ChevronRight } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { cn } from "@shared/lib/utils";
import { formatDuration } from "@shared/utils/formatters";

import type { TraceErrorGroup } from "@shared/api/traces/schemas";

interface Props {
  readonly groups: readonly TraceErrorGroup[];
  readonly onSpanClick: (span: { span_id: string }) => void;
}

const sectT = "text-[10.5px] tracking-[0.06em] uppercase text-foreground-caption";

/**
 * Per-trace error summary: exceptions grouped by type with a count, each row
 * expandable to the offending spans. Sourced from `getTraceErrors` (the
 * backend's grouped view) — complements the flat error-span list below it by
 * answering "which exception types failed, and how often" first.
 */
function TraceErrorSummaryComponent({ groups, onSpanClick }: Props) {
  const ordered = useMemo(() => [...groups].sort((a, b) => b.count - a.count), [groups]);
  const totalErrors = useMemo(() => ordered.reduce((acc, g) => acc + g.count, 0), [ordered]);

  if (ordered.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className={sectT}>
        {totalErrors} error{totalErrors === 1 ? "" : "s"} · {ordered.length} exception type
        {ordered.length === 1 ? "" : "s"}
      </div>
      <div className="flex flex-col gap-1.5">
        {ordered.map((g) => (
          <ErrorGroupRow key={g.exception_type} group={g} onSpanClick={onSpanClick} />
        ))}
      </div>
    </div>
  );
}

function ErrorGroupRow({
  group,
  onSpanClick,
}: {
  group: TraceErrorGroup;
  onSpanClick: (span: { span_id: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[10px] border border-error-subtle bg-secondary">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-muted"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ChevronRight
          size={13}
          className={cn("text-foreground-caption transition-transform", open && "rotate-90")}
        />
        <AlertTriangle size={13} className="flex-none text-error" />
        <span className="truncate font-mono text-[12.5px] text-foreground">
          {group.exception_type || "Error"}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-error-subtle px-[7px] py-[2px] font-mono text-[10.5px] text-error">
          ×{group.count}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-px border-border border-t">
          {group.spans.map((s) => (
            <button
              key={s.span_id}
              type="button"
              className="flex cursor-pointer flex-col gap-0.5 border-border border-b bg-background px-3 py-2 text-left last:border-b-0 hover:bg-muted"
              onClick={() => onSpanClick({ span_id: s.span_id })}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-foreground-muted">{s.service_name}</span>
                <span className="truncate font-mono text-[12px] text-foreground">
                  {s.operation_name}
                </span>
                <span className="ml-auto font-mono text-[11px] text-foreground-caption">
                  {formatDuration(s.duration_ms)}
                </span>
              </div>
              {(s.exception_message || s.status_message) && (
                <div className="break-words text-[11.5px] text-foreground-secondary leading-[1.45]">
                  {s.exception_message || s.status_message}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const TraceErrorSummary = memo(TraceErrorSummaryComponent);
