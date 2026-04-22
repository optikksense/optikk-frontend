import { memo } from "react";

import { severityStyle } from "../utils/severity";

interface Props {
  readonly bucket: number;
  readonly compact?: boolean;
}

/**
 * Colored severity pill keyed off `severity_bucket` (0..5). The left 2px
 * stripe mirrors Datadog's row affordance — when composed inside `LogRow`
 * it doubles as the row-level severity marker so the badge can render
 * inline in compact tables.
 */
export const LogSeverityBadge = memo(function LogSeverityBadge({ bucket, compact }: Props) {
  const style = severityStyle(bucket);
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 font-mono text-[11px] leading-5"
      style={{
        backgroundColor: `${style.color}22`,
        color: style.color,
        borderLeft: `3px solid ${style.color}`,
      }}
      title={style.label}
      aria-label={`Severity ${style.label}`}
    >
      {compact ? style.shortLabel : style.label}
    </span>
  );
});

export default LogSeverityBadge;
