import { memo } from "react";

import { useLogRow } from "../hooks/useLogRow";
import type { LogRecord } from "../types/log";

interface Props {
  readonly row: LogRecord;
}

function Row({
  label,
  value,
  href,
  onCopy,
}: {
  readonly label: string;
  readonly value: string | undefined;
  readonly href?: string | null;
  readonly onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] py-2">
      <span className="text-[11px] uppercase text-[var(--text-muted)]">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        {value ? (
          <span className="truncate font-mono text-[12px] text-[var(--text-primary)]">{value}</span>
        ) : (
          <span className="text-[12px] text-[var(--text-muted)]">—</span>
        )}
        {value && onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Copy
          </button>
        ) : null}
        {href ? (
          <a
            href={href}
            className="rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[11px] text-[var(--accent-primary)] hover:underline"
          >
            Open trace
          </a>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Correlations tab: clickable `trace_id` → trace detail page; `span_id`
 * is rendered as a copyable handle (span deep-link is driven by the
 * trace detail page, not a standalone route).
 */
export const LogDetailCorrelationsTab = memo(function LogDetailCorrelationsTab({ row }: Props) {
  const helpers = useLogRow(row);
  return (
    <div className="flex flex-col p-3">
      <Row
        label="trace_id"
        value={row.trace_id}
        href={helpers.traceDetailHref}
        onCopy={helpers.copyTraceId}
      />
      <Row label="span_id" value={row.span_id} />
      <Row label="service" value={row.service_name} />
      <Row label="host" value={row.host} />
      <Row label="pod" value={row.pod} />
      <Row label="environment" value={row.environment} />
    </div>
  );
});

export default LogDetailCorrelationsTab;
