import { memo } from "react";

/** Sticky column header row for the log table. */
function LogsTableHeaderComponent() {
  return (
    <div className="ok-th">
      <span />
      <span>Timestamp</span>
      <span>Service</span>
      <span>Level</span>
      <span>Message</span>
    </div>
  );
}

export const LogsTableHeader = memo(LogsTableHeaderComponent);
