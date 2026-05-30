import { type ReactNode, memo } from "react";

export type TraceScope = "traces" | "spans";

interface Props {
  readonly scope: TraceScope;
  readonly onChange: (next: TraceScope) => void;
  readonly trailing?: ReactNode;
}

/** Datadog-style "Traces | Spans" segmented control for the explorer. */
function TraceScopeToggleComponent({ scope, onChange, trailing }: Props) {
  return (
    <div className="flex items-center gap-1 border-border border-b bg-background px-3 py-1 text-[11px]">
      <span className="text-foreground-muted">View:</span>
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
    ? "rounded bg-secondary px-2 py-0.5 font-semibold text-foreground"
    : "rounded px-2 py-0.5 text-foreground-muted hover:text-foreground";
}

export const TraceScopeToggle = memo(TraceScopeToggleComponent);
