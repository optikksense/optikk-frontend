import { AlertTriangle, ChevronRight } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { formatDuration } from "@shared/utils/formatters";

import type { TraceErrorGroup } from "@shared/api/schemas/tracesSchemas";

interface Props {
  readonly groups: readonly TraceErrorGroup[];
  readonly onSpanClick: (span: { span_id: string }) => void;
}

const sectT = "text-[10.5px] tracking-[0.06em] uppercase text-[var(--text-caption)]";

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
    <div className="rounded-[10px] border border-[var(--color-error-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left cursor-pointer hover:bg-[var(--bg-tertiary)]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ChevronRight
          size={13}
          className={cn(
            "text-[var(--text-caption)] transition-transform",
            open && "rotate-90"
          )}
        />
        <AlertTriangle size={13} className="text-[var(--color-error)] flex-none" />
        <span className="font-mono text-[12.5px] text-[var(--text-primary)] truncate">
          {group.exception_type || "Error"}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 px-[7px] py-[2px] rounded-full text-[10.5px] font-mono bg-[var(--color-error-subtle)] text-[var(--color-error)]">
          ×{group.count}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-px border-t border-[var(--border-color)]">
          {group.spans.map((s) => (
            <button
              key={s.span_id}
              type="button"
              className="flex flex-col gap-0.5 px-3 py-2 text-left cursor-pointer bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] last:border-b-0"
              onClick={() => onSpanClick({ span_id: s.span_id })}
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] text-[11.5px]">{s.service_name}</span>
                <span className="font-mono text-[12px] text-[var(--text-primary)] truncate">
                  {s.operation_name}
                </span>
                <span className="ml-auto font-mono text-[11px] text-[var(--text-caption)]">
                  {formatDuration(s.duration_ms)}
                </span>
              </div>
              {(s.exception_message || s.status_message) && (
                <div className="text-[11.5px] text-[var(--text-secondary)] leading-[1.45] break-words">
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
