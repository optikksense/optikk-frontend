import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicTo } from "@shared/utils/navigation";

import { relativeTimeFromIso } from "../../ServiceDetailPage/formatters";
import { type RecentDeploy, useRecentDeploys } from "../hooks/useRecentDeploys";

function DeployRow({ row }: { row: RecentDeploy }) {
  const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(row.service_name));
  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-baseline gap-3 border-[var(--border-color)] border-t px-4 py-3 text-[12px] first:border-t-0">
      <div className="flex min-w-0 items-baseline gap-2">
        <Link
          to={dynamicTo(detail)}
          className="truncate font-mono text-[var(--text-primary)] hover:text-[var(--color-primary,#3b82f6)]"
        >
          {row.service_name}
        </Link>
        <span className="text-[var(--text-muted)]">→</span>
        <span className="font-mono text-[var(--text-primary)]">{row.version}</span>
        {row.commit_sha && (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            ({row.commit_sha.slice(0, 8)})
          </span>
        )}
      </div>
      <span className="font-mono text-[11px] text-[var(--text-muted)]">{row.environment}</span>
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {relativeTimeFromIso(row.deployed_at)}
      </span>
    </li>
  );
}

export function DeploysList() {
  const { rows, isPending } = useRecentDeploys(50);
  if (rows.length === 0) {
    return (
      <div className="grid h-[160px] place-items-center text-[12px] text-[var(--text-muted)]">
        {isPending ? "Loading deploys…" : "No deploys."}
      </div>
    );
  }
  return (
    <ul>
      {rows.map((row) => (
        <DeployRow key={`${row.service_name}::${row.version}::${row.environment}`} row={row} />
      ))}
    </ul>
  );
}
