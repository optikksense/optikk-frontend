import { useParams } from "@tanstack/react-router";
import { Server } from "lucide-react";

import { Card, SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { getNodeServices } from "../../api/hostsApi";
import type { InfrastructureNodeService } from "../../api/hostsApi";
import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

const columns: SimpleTableColumn<InfrastructureNodeService>[] = [
  { title: "Service", key: "service_name", width: 220 },
  {
    title: "Requests",
    key: "request_count",
    align: "right",
    width: 120,
    render: (_v, row) => formatNumber(row.request_count),
    sorter: (a, b) => a.request_count - b.request_count,
    defaultSortOrder: "descend",
  },
  {
    title: "Errors",
    key: "error_count",
    align: "right",
    width: 100,
    render: (_v, row) => formatNumber(row.error_count),
  },
  {
    title: "Error %",
    key: "error_rate",
    align: "right",
    width: 100,
    render: (_v, row) => `${(row.error_rate * 100).toFixed(2)}%`,
  },
  {
    title: "Avg latency",
    key: "avg_latency_ms",
    align: "right",
    width: 130,
    render: (_v, row) => fmtMs(row.avg_latency_ms),
  },
  {
    title: "p95",
    key: "p95_latency_ms",
    align: "right",
    width: 110,
    render: (_v, row) => fmtMs(row.p95_latency_ms),
  },
  {
    title: "Pods",
    key: "pod_count",
    align: "right",
    width: 80,
    render: (_v, row) => formatNumber(row.pod_count),
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

export default function HostDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const host = decodeURIComponent(typeof params.host === "string" ? params.host : "");

  const servicesQ = useTimeRangeQuery(`host-services-${host}`, (_t, s, e) =>
    getNodeServices(host, Number(s), Number(e))
  );
  const services = servicesQ.data ?? [];

  const totalReq = services.reduce((acc, s) => acc + s.request_count, 0);
  const totalErr = services.reduce((acc, s) => acc + s.error_count, 0);
  const errRate = totalReq > 0 ? (totalErr / totalReq) * 100 : 0;

  return (
    <PageShell>
      <PageHeader
        title={host}
        subtitle="Host overview — services running on this node and their RED metrics."
        icon={<Server size={24} />}
      />

      <PageSurface elevation={1} padding="md">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label="Services" value={formatNumber(services.length)} />
          <StatTile label="Requests" value={formatNumber(totalReq)} />
          <StatTile label="Errors" value={formatNumber(totalErr)} />
          <StatTile label="Error %" value={`${errRate.toFixed(2)}%`} />
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-3 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Services on this host
        </div>
        <SimpleTable
          columns={columns}
          dataSource={services}
          rowKey={(r) => r.service_name}
          pagination={{ pageSize: 25 }}
        />
      </PageSurface>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`host-cpu-${host}`}
            endpoint="/v1/infrastructure/cpu/by-instance"
            title="CPU by instance"
            groupByField="host"
            valueField="value"
            formatType="percentage"
            extraParams={{ host }}
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`host-mem-${host}`}
            endpoint="/v1/infrastructure/memory/by-instance"
            title="Memory by instance"
            groupByField="host"
            valueField="value"
            formatType="bytes"
            extraParams={{ host }}
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`host-disk-${host}`}
            endpoint="/v1/infrastructure/disk/by-instance"
            title="Disk by instance"
            groupByField="host"
            valueField="value"
            formatType="bytes"
            extraParams={{ host }}
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`host-net-${host}`}
            endpoint="/v1/infrastructure/network/by-instance"
            title="Network by instance"
            groupByField="host"
            valueField="value"
            formatType="bytes"
            extraParams={{ host }}
          />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey={`host-pool-${host}`}
            endpoint="/v1/infrastructure/connpool/by-instance"
            title="Connection pool by instance"
            groupByField="host"
            valueField="value"
            formatType="percentage"
            extraParams={{ host }}
          />
        </Card>
      </div>
    </PageShell>
  );
}
