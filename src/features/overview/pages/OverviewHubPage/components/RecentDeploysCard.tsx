import { useLocation, useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { Skeleton, Surface } from "@/components/ui";
import type { ServiceLatestDeployment } from "@shared/api/deployments/deploymentsApi";
import { buildServiceDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { ROUTES } from "@/shared/constants/routes";

interface Props {
  readonly rows: readonly ServiceLatestDeployment[] | undefined;
  readonly loading: boolean;
}

function relativeTime(iso: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function Row({
  row,
  onOpen,
}: {
  readonly row: ServiceLatestDeployment;
  readonly onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-between gap-3 rounded-md bg-[var(--bg-inset)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-hover)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono font-medium text-[12px] text-[var(--text-primary)]">
            {row.service_name}
          </span>
          <span className="font-mono text-[10.5px] text-[var(--text-muted)]">{row.version}</span>
        </div>
        <div className="font-mono text-[10.5px] text-[var(--text-muted)]">
          {row.environment} · {relativeTime(row.deployed_at)}
        </div>
      </div>
      {row.is_active ? (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: "var(--color-healthy)" }}
          aria-label="active"
        />
      ) : null}
    </button>
  );
}

export default function RecentDeploysCard({ rows, loading }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const visible = (rows ?? []).slice(0, 6);

  const open = (row: ServiceLatestDeployment): void => {
    const search = buildServiceDrawerSearch(location.search, row.service_name);
    navigate({ to: location.pathname + search });
  };

  return (
    <Surface elevation={1} padding="md" className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-semibold text-[13px] text-[var(--text-primary)]">
            Recent deploys
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Latest active version per service</div>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.deployments })}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        >
          <ExternalLink size={12} />
          All deploys
        </button>
      </div>

      {loading && visible.length === 0 ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : visible.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-[var(--text-muted)]">
          No recent deploys
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {visible.map((row) => (
            <Row
              key={`${row.service_name}::${row.version}::${row.deployed_at}`}
              row={row}
              onOpen={() => open(row)}
            />
          ))}
        </div>
      )}
    </Surface>
  );
}
