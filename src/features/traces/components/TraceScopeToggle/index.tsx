import { memo, type ReactNode } from "react";

export type TraceScope = "traces" | "spans";

interface Props {
  readonly scope: TraceScope;
  readonly onChange: (next: TraceScope) => void;
  readonly trailing?: ReactNode;
}

/** Datadog-style "Traces | Spans" segmented control for the explorer. */
function TraceScopeToggleComponent({ scope, onChange, trailing }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1 text-[11px]">
      <span className="text-[var(--text-muted)]">View:</span>
      <button
        type="button"
        onClick={() => onChange("traces")}
        className={className(scope === "traces")}
      >
        Traces
      </button>
      <button
        type="button"
        onClick={() => onChange("spans")}
        className={className(scope === "spans")}
      >
        Spans
      </button>
      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  );
}

function className(active: boolean): string {
  return active
    ? "rounded bg-[var(--bg-secondary)] px-2 py-0.5 font-semibold text-[var(--text-primary)]"
    : "rounded px-2 py-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]";
}

export const TraceScopeToggle = memo(TraceScopeToggleComponent);
