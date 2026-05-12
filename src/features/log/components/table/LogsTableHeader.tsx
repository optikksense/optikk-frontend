import { memo } from "react";

/** Sticky column header row for the log table. */
function LogsTableHeaderComponent() {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5">
      {/* Expand spacer */}
      <div className="w-5 shrink-0" />

      <span className="w-[180px] shrink-0 font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        Timestamp
      </span>
      <span className="w-[140px] shrink-0 font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        Service
      </span>
      <span className="w-[52px] shrink-0 font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        Level
      </span>
      <span className="min-w-0 flex-1 font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        Message
      </span>
    </div>
  );
}

export const LogsTableHeader = memo(LogsTableHeaderComponent);
