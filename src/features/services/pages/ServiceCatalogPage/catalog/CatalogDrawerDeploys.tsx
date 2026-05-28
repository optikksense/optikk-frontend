import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type DeploymentListResponse,
  deploymentsApi,
} from "@/features/overview/api/deploymentsApi";

import { relativeTimeFromIso } from "../../ServiceDetailPage/formatters";

interface CatalogDrawerDeploysProps {
  readonly serviceName: string;
}

export function CatalogDrawerDeploys({ serviceName }: CatalogDrawerDeploysProps) {
  const query = useTimeRangeQuery<DeploymentListResponse>(
    "service-hub.drawer-deploys",
    (_team, s, e) => deploymentsApi.getList(serviceName, s, e),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
  const rows = (query.data?.deployments ?? []).slice(0, 5);
  if (rows.length === 0) {
    return (
      <div className="text-[11px] text-[var(--text-muted)]">
        {query.isPending ? "Loading…" : "No deploys in window."}
      </div>
    );
  }
  return (
    <ul>
      {rows.map((row) => (
        <li
          key={`${row.version}::${row.environment}`}
          className="flex items-baseline justify-between gap-2 border-[var(--border-color)] border-t px-3 py-1.5 text-[11px] first:border-t-0"
        >
          <span className="font-mono text-[var(--text-primary)]">{row.version}</span>
          <span className="text-[var(--text-muted)]">
            {row.environment} · {relativeTimeFromIso(row.last_seen)}
          </span>
        </li>
      ))}
    </ul>
  );
}
