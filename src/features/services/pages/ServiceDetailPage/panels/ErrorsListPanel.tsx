import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

import type { ErrorGroup } from "@/features/errors/api/errorGroupsApi";

import { fmtNum, relativeTimeFromIso } from "../formatters";
import { useServiceErrors } from "../hooks/useServiceErrors";
import { PanelCard } from "./PanelCard";

function ErrorRow({ row }: { row: ErrorGroup }) {
  const detail = ROUTES.errorGroupDetail.replace("$groupId", encodeURIComponent(row.group_id));
  return (
    <li className="flex items-start justify-between gap-3 border-border border-t px-4 py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <Link
          to={detail}
          className="block truncate font-mono font-medium text-[12px] text-[var(--color-error,#ef4444)] hover:underline"
        >
          {row.operation_name || row.status_message || row.group_id}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[11px] text-foreground-muted">
          {row.status_message && (
            <span className="truncate text-foreground-secondary">{row.status_message}</span>
          )}
          {row.http_status_code > 0 && <span>http {row.http_status_code}</span>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-semibold text-[15px] text-foreground tabular-nums">
          {fmtNum(row.error_count)}
        </div>
        <div className="text-[10px] text-foreground-muted">
          last {relativeTimeFromIso(row.last_occurrence)}
        </div>
      </div>
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
      subtitle={data ? `${data.length} unique · last 60m` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
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
