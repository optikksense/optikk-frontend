import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertOctagon } from "lucide-react";

import {
  SimpleTable,
  type SimpleTableColumn,
  Surface,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import {
  type ErrorGroupTrace,
  getErrorGroupDetail,
  getErrorGroupTimeseries,
  getErrorGroupTraces,
} from "../../api/errorGroupsApi";

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const traceColumns: SimpleTableColumn<ErrorGroupTrace>[] = [
  {
    title: "Trace",
    key: "trace_id",
    render: (_v, row) => (
      <span className="font-mono text-[12px] text-[var(--text-primary)]">
        {row.trace_id.slice(0, 16)}…
      </span>
    ),
  },
  {
    title: "Status",
    key: "status_code",
    width: 100,
    render: (_v, row) => (
      <span className="text-[12px] text-[var(--text-secondary)]">{row.status_code || "—"}</span>
    ),
  },
  {
    title: "Duration",
    key: "duration_ms",
    width: 120,
    align: "right",
    render: (_v, row) =>
      row.duration_ms >= 1000
        ? `${(row.duration_ms / 1000).toFixed(2)}s`
        : `${Math.round(row.duration_ms)}ms`,
  },
  {
    title: "Timestamp",
    key: "timestamp",
    width: 200,
    render: (_v, row) => (
      <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(row.timestamp)}</span>
    ),
  },
];

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-1 font-semibold text-[18px] tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

export default function ErrorGroupDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const groupId = decodeURIComponent(typeof params.groupId === "string" ? params.groupId : "");

  const detailQ = useStandardQuery({
    queryKey: ["error-group-detail", groupId],
    queryFn: () => getErrorGroupDetail(groupId),
    enabled: !!groupId,
  });

  const timeseriesQ = useTimeRangeQuery(`error-group-ts-${groupId}`, (_t, s, e) =>
    getErrorGroupTimeseries(groupId, Number(s), Number(e))
  );

  const tracesQ = useTimeRangeQuery(`error-group-traces-${groupId}`, (_t, s, e) =>
    getErrorGroupTraces(groupId, Number(s), Number(e), 50)
  );

  const detail = detailQ.data;
  const totalErrors =
    timeseriesQ.data?.reduce((acc, p) => acc + (p.error_count ?? 0), 0) ?? 0;

  return (
    <PageShell>
      <PageHeader
        title={detail?.exception_type || detail?.status_message || "Error group"}
        subtitle={detail ? `${detail.service_name} · ${detail.operation_name}` : "Loading…"}
        icon={<AlertOctagon size={24} />}
      />

      <Surface elevation={1} padding="md">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label="Service" value={detail?.service_name ?? "—"} />
          <StatTile label="HTTP status" value={detail?.http_status_code?.toString() ?? "—"} />
          <StatTile label="Errors in window" value={formatNumber(totalErrors)} />
          <StatTile
            label="Last seen"
            value={detail?.last_occurrence ? fmtDate(detail.last_occurrence) : "—"}
          />
        </div>
      </Surface>

      {detail?.stack_trace ? (
        <PageSurface padding="lg">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Stack trace
          </div>
          <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-primary)]">
            {detail.stack_trace}
          </pre>
        </PageSurface>
      ) : null}

      <PageSurface padding="lg">
        <div className="mb-3 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Sample traces
        </div>
        <SimpleTable
          columns={traceColumns}
          dataSource={tracesQ.data ?? []}
          rowKey={(r) => `${r.trace_id}::${r.span_id}`}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () =>
              navigate({ to: `/traces/${encodeURIComponent(record.trace_id)}` }),
            style: { cursor: "pointer" },
          })}
        />
      </PageSurface>
    </PageShell>
  );
}
