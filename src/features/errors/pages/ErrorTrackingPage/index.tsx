import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import {
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import {
  type ErrorGroup,
  listErrorGroups,
} from "../../api/errorGroupsApi";

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const columns: SimpleTableColumn<ErrorGroup>[] = [
  {
    title: "Service",
    key: "service_name",
    width: 180,
    render: (_v, row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.service_name}</span>
    ),
  },
  {
    title: "Operation",
    key: "operation_name",
    width: 220,
    render: (_v, row) => (
      <span className="font-mono text-[12px] text-[var(--text-secondary)]">
        {row.operation_name}
      </span>
    ),
  },
  {
    title: "Status message",
    key: "status_message",
    render: (_v, row) => (
      <span className="text-[12px] text-[var(--text-primary)]">
        {row.status_message || "—"}
      </span>
    ),
  },
  {
    title: "HTTP",
    key: "http_status_code",
    width: 80,
    align: "right",
    render: (_v, row) => row.http_status_code || "—",
  },
  {
    title: "Errors",
    key: "error_count",
    width: 110,
    align: "right",
    render: (_v, row) => formatNumber(row.error_count),
    sorter: (a, b) => a.error_count - b.error_count,
    defaultSortOrder: "descend",
  },
  {
    title: "Last seen",
    key: "last_occurrence",
    width: 200,
    render: (_v, row) => (
      <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(row.last_occurrence)}</span>
    ),
  },
];

export default function ErrorTrackingPage(): JSX.Element {
  const navigate = useNavigate();
  const groupsQ = useTimeRangeQuery("errors-groups", (_t, s, e) =>
    listErrorGroups(Number(s), Number(e), { limit: 200 })
  );

  return (
    <PageShell>
      <PageHeader
        title="Error tracking"
        subtitle="Grouped error issues across all services. Click a row to inspect occurrences and sample traces."
        icon={<AlertTriangle size={24} />}
      />

      {groupsQ.error ? (
        <div
          className="rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-red-300 text-sm"
          role="alert"
        >
          Could not load error groups: {(groupsQ.error as Error).message}
        </div>
      ) : null}

      <PageSurface padding="lg">
        <SimpleTable
          columns={columns}
          dataSource={groupsQ.data ?? []}
          rowKey={(r) => r.group_id}
          pagination={{ pageSize: 25 }}
          onRow={(record) => ({
            onClick: () => navigate({ to: `/errors/${encodeURIComponent(record.group_id)}` }),
            style: { cursor: "pointer" },
          })}
        />
      </PageSurface>
    </PageShell>
  );
}
