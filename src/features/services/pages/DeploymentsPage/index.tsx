import { useNavigate } from "@tanstack/react-router";
import { GitBranch } from "lucide-react";

import {
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { formatNumber } from "@shared/utils/formatters";

import {
  type ServiceLatestDeployment,
  deploymentsApi,
} from "../../../overview/api/deploymentsApi";

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const columns: SimpleTableColumn<ServiceLatestDeployment>[] = [
  {
    title: "Service",
    key: "service_name",
    width: 240,
    render: (_v, row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.service_name}</span>
    ),
  },
  {
    title: "Version",
    key: "version",
    width: 200,
    render: (_v, row) => (
      <span className="font-mono text-[12px] text-[var(--text-secondary)]">{row.version}</span>
    ),
  },
  {
    title: "Environment",
    key: "environment",
    width: 140,
    render: (_v, row) => row.environment,
  },
  {
    title: "Deployed",
    key: "deployed_at",
    width: 220,
    render: (_v, row) => (
      <span className="text-[11px] text-[var(--text-muted)]">
        {fmtDate(row.deployed_at)}
      </span>
    ),
  },
  {
    title: "Commit",
    key: "commit_sha",
    render: (_v, row) =>
      row.commit_sha ? (
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {row.commit_sha.slice(0, 8)}
        </span>
      ) : (
        "—"
      ),
  },
];

export default function DeploymentsPage(): JSX.Element {
  const navigate = useNavigate();
  const latestQ = useStandardQuery({
    queryKey: ["deployments-latest-by-service"],
    queryFn: () => deploymentsApi.getLatestByService(),
  });

  const rows = latestQ.data ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Deployments"
        subtitle="Latest version per service across all environments. Click a row to drill into version history and impact."
        icon={<GitBranch size={24} />}
      />

      {latestQ.error ? (
        <div
          className="rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-red-300 text-sm"
          role="alert"
        >
          Could not load deployments: {(latestQ.error as Error).message}
        </div>
      ) : null}

      <PageSurface padding="lg">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
            Latest by service ({formatNumber(rows.length)})
          </div>
        </div>
        <SimpleTable
          columns={columns}
          dataSource={rows}
          rowKey={(r) => `${r.service_name}::${r.version}::${r.environment}`}
          pagination={{ pageSize: 25 }}
          onRow={(record) => ({
            onClick: () =>
              navigate({ to: `/services/${encodeURIComponent(record.service_name)}` }),
            style: { cursor: "pointer" },
          })}
        />
      </PageSurface>

      <PageSurface padding="lg">
        <div className="text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Cross-service deployment timeline
        </div>
        <div className="mt-2 text-[12px] text-[var(--text-secondary)]">
          Phase 2 follow-up: vertical-marker timeline per service using{" "}
          <code className="font-mono text-[11px]">/deployments/timeline</code>. APIs are wired.
        </div>
      </PageSurface>
    </PageShell>
  );
}
