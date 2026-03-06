interface TraceMethodBadgeProps {
  method: string;
}

/**
 * Compact method badge used in trace table cells.
 */
export default function TraceMethodBadge({ method }: TraceMethodBadgeProps): JSX.Element | null {
  if (!method) return null;
  const normalizedMethod = method.toUpperCase();
  return <span className={`traces-method-badge ${normalizedMethod}`}>{normalizedMethod}</span>;
}

