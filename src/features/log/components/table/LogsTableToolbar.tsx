import { memo } from "react";

/** Header strip above the log table. */
function LogsTableToolbarComponent() {
  return (
    <div className="flex shrink-0 items-center justify-between border-[var(--line)] border-b px-[18px] py-3">
      <span className="font-semibold text-[11px] text-[var(--fg-2)] uppercase tracking-[0.08em]">
        Results
      </span>
    </div>
  );
}

export const LogsTableToolbar = memo(LogsTableToolbarComponent);
