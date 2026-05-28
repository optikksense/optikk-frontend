import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

import type { ErrorGroup } from "@/features/errors/api/errorGroupsApi";

import { fmtNum, relativeTimeFromIso } from "../formatters";
import { useServiceErrors } from "../hooks/useServiceErrors";
import { PanelCard } from "./PanelCard";

function ErrorRow({ row }: { row: ErrorGroup }) {
  const detail = ROUTES.errorGroupDetail.replace("$groupId", encodeURIComponent(row.group_id));
  return (
    <li className="border-[var(--border-color)] border-t px-4 py-3 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          to={detail}
          className="truncate font-mono text-[12px] text-[var(--color-error,#ef4444)] hover:underline"
        >
          {row.operation_name || row.status_message || row.group_id}
        </Link>
        <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
          last{" "}
          <strong className="text-[var(--text-primary)]">
            {relativeTimeFromIso(row.last_occurrence)}
          </strong>
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
        <span>
          <strong className="text-[var(--text-primary)]">{fmtNum(row.error_count)}</strong>{" "}
          occurrences
        </span>
        {row.http_status_code > 0 && <span>http {row.http_status_code}</span>}
      </div>
      {row.status_message && (
        <div className="mt-1 truncate text-[11px] text-[var(--text-primary)]">
          {row.status_message}
        </div>
      )}
    </li>
  );
}

interface ErrorsListPanelProps {
  readonly serviceName: string;
  readonly maxRows?: number;
  readonly title?: string;
}

export function ErrorsListPanel({
  serviceName,
  maxRows = 6,
  title = "Top errors",
}: ErrorsListPanelProps) {
  const { data, isPending } = useServiceErrors(serviceName, Math.max(maxRows, 25));
  const rows = (data ?? []).slice(0, maxRows);
  return (
    <PanelCard
      title={title}
      subtitle={data ? `${data.length} unique error groups` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No errors in selected range."}
        </div>
      ) : (
        <ul>
          {rows.map((row) => (
            <ErrorRow key={row.group_id} row={row} />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
