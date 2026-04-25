import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { memo, useState } from "react";

import type { TraceErrorGroup } from "@shared/api/schemas/tracesSchemas";
import { formatDuration } from "@shared/utils/formatters";

interface Props {
  readonly groups: readonly TraceErrorGroup[] | undefined;
  readonly isPending: boolean;
  readonly onSpanClick?: (spanId: string) => void;
}

/** Trace-level error groups (by exception type). Datadog parity for B7. */
function TraceErrorsPanelComponent({ groups, isPending, onSpanClick }: Props) {
  if (isPending) return <Loading />;
  if (!groups || groups.length === 0) return null;
  return (
    <section className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)]">
      <header className="flex items-center gap-2 border-b border-[var(--border-color)] px-3 py-2">
        <AlertTriangle size={14} className="text-[#e8494d]" />
        <span className="text-[12px] font-semibold">Errors</span>
        <span className="text-[11px] text-[var(--text-muted)]">· {groups.length} group{groups.length === 1 ? "" : "s"}</span>
      </header>
      <ul className="flex flex-col divide-y divide-[var(--border-color)]">
        {groups.map((g) => <ErrorGroupRow key={g.exception_type} group={g} onSpanClick={onSpanClick} />)}
      </ul>
    </section>
  );
}

function ErrorGroupRow({ group, onSpanClick }: { group: TraceErrorGroup; onSpanClick?: (spanId: string) => void }) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <li className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[var(--bg-secondary)]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Chevron size={12} className="flex-shrink-0 text-[var(--text-muted)]" />
          <span className="truncate font-mono text-[12px] text-[#e8494d]">{group.exception_type}</span>
        </span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">{group.count} span{group.count === 1 ? "" : "s"}</span>
      </button>
      {open ? (
        <ul className="flex flex-col gap-1 px-3 pb-2 text-[11px]">
          {group.spans.slice(0, 20).map((sp) => (
            <li key={sp.span_id}>
              <button
                type="button"
                onClick={() => onSpanClick?.(sp.span_id)}
                className="flex w-full items-start justify-between gap-2 rounded px-2 py-1 text-left hover:bg-[var(--bg-secondary)]"
              >
                <span className="truncate">
                  <span className="text-[var(--text-muted)]">{sp.service_name} ·</span>{" "}
                  <span className="font-semibold">{sp.operation_name}</span>
                  {sp.exception_message ? <span className="block truncate text-[10px] text-[var(--text-muted)]">{sp.exception_message}</span> : null}
                </span>
                <span className="flex-shrink-0 font-mono text-[var(--text-muted)]">{formatDuration(sp.duration_ms)}</span>
              </button>
            </li>
          ))}
          {group.spans.length > 20 ? (
            <li className="px-2 text-[10px] text-[var(--text-muted)]">+{group.spans.length - 20} more</li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}

function Loading() {
  return <div className="p-4 text-[12px] text-[var(--text-muted)]">Loading errors…</div>;
}

export const TraceErrorsPanel = memo(TraceErrorsPanelComponent);
