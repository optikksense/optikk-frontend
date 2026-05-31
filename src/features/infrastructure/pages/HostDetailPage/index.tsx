import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { PageShell } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { getNodeServices, getNodes } from "../../api/hostsApi";
import type { InfrastructureNode, InfrastructureNodeService } from "../../api/hostsApi";
import { InfraLogsLink } from "../../components/InfraLogsLink";
import { tierForNode } from "../../utils/nodeHealth";
import { HostDetailContainers } from "./HostDetailContainers";
import { HostDetailHero, type HostStatus } from "./HostDetailHero";
import { HostDetailKpiCards } from "./HostDetailKpiCards";
import { HostDetailSystemMetrics } from "./HostDetailSystemMetrics";

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

const SERVICE_COLUMNS: SimpleTableColumn<InfrastructureNodeService>[] = [
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

function useHostNode(host: string): InfrastructureNode | null {
  const nodesQ = useTimeRangeQuery<readonly InfrastructureNode[]>(
    "host-detail.nodes-list",
    (_team, s, e) => getNodes(s, e)
  );
  return useMemo(
    () => nodesQ.data?.find((node) => node.host === host) ?? null,
    [nodesQ.data, host]
  );
}

function statusFromNode(node: InfrastructureNode | null): HostStatus {
  if (!node) return "unknown";
  const tier = tierForNode(node);
  if (tier === "unhealthy") return "alerting";
  if (tier === "degraded") return "warn";
  return "healthy";
}

export default function HostDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const host = decodeURIComponent(typeof params.host === "string" ? params.host : "");
  const node = useHostNode(host);
  const status = statusFromNode(node);

  const servicesQ = useTimeRangeQuery(`host-services-${host}`, (_t, s, e) =>
    getNodeServices(host, Number(s), Number(e))
  );
  const services = servicesQ.data ?? [];

  return (
    <PageShell>
      <HostDetailHero host={host} node={node} status={status} />
      <HostDetailKpiCards host={host} />
      <HostDetailSystemMetrics host={host} />
      <section className="rounded-md border border-border bg-card p-4">
        <div className="mb-3 font-semibold text-[13px] text-foreground">Services on this host</div>
        <SimpleTable
          columns={SERVICE_COLUMNS}
          dataSource={services}
          rowKey={(r) => r.service_name}
          pagination={{ pageSize: 25 }}
        />
      </section>
      <HostDetailContainers host={host} />
      <InfraLogsLink scope="host" value={host} />
    </PageShell>
  );
}
