interface TraceStatusBadgeProps {
  status: string;
}

/**
 * Status badge for trace status cells and detail panel title badges.
 */
export default function TraceStatusBadge({ status }: TraceStatusBadgeProps): JSX.Element {
  const normalizedStatus = (status || "UNSET").toUpperCase();
  const statusClass =
    normalizedStatus === "OK" ? "ok" : normalizedStatus === "ERROR" ? "error" : "unset";

  return (
    <span className={`traces-status-badge ${statusClass}`}>
      <span className="traces-status-badge-dot" />
      {normalizedStatus}
    </span>
  );
}
