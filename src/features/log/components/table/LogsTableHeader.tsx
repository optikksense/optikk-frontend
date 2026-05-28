import { memo } from "react";

/** Sticky column header row for the log table. */
function LogsTableHeaderComponent() {
  return (
    <div className="sticky top-0 z-[2] grid grid-cols-[24px_200px_160px_80px_1fr] gap-4 border-b border-[var(--line)] bg-[var(--bg-1)] px-[18px] py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--fg-3)]">
      <span />
      <span>Timestamp</span>
      <span>Service</span>
      <span>Level</span>
      <span>Message</span>
    </div>
  );
}

export const LogsTableHeader = memo(LogsTableHeaderComponent);
