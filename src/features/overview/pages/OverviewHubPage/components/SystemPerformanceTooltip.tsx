import { memo } from "react";

export interface HoverState {
  left: number;
  top: number;
  title?: string;
  rows: Array<{ label: string; value: string; color?: string }>;
}

export const SystemPerformanceTooltip = memo(function SystemPerformanceTooltip({
  hoverState,
}: {
  hoverState: HoverState;
}) {
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[220px] rounded-[var(--card-radius)] border border-border bg-surface-overlay px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-[10px]"
      style={{ left: hoverState.left, top: hoverState.top }}
    >
      {hoverState.title ? (
        <div className="mb-2 font-semibold text-[11px] text-foreground-secondary">
          {hoverState.title}
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        {hoverState.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-[11px]">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color ?? "var(--text-muted)" }}
              />
              <span className="truncate text-foreground-secondary">{row.label}</span>
            </div>
            <span className="shrink-0 font-mono text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
