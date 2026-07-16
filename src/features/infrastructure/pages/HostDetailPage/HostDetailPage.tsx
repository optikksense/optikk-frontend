import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageShell } from "@shared/components/ui";
import DataTable from "@shared/components/ui/data-display/DataTable";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import { getHostOverview } from "../../api/hostDetailApi";
import { getNodeServices, getNodes } from "../../api/hostsApi";
import type { InfrastructureNode, InfrastructureNodeService } from "../../api/hostsApi";
import { tierForNode } from "../../utils/nodeHealth";
import { HostDetailAbout } from "./HostDetailAbout";
import { HostDetailContainers } from "./HostDetailContainers";
import { HostDetailHero, type HostStatus } from "./HostDetailHero";
import { HostDetailKpiCards } from "./HostDetailKpiCards";
import { HostDetailLogs } from "./HostDetailLogs";
import { HostDetailNetwork } from "./HostDetailNetwork";
import { HostDetailSystemMetrics } from "./HostDetailSystemMetrics";

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

const SERVICE_COLUMNS: ColumnDef<InfrastructureNodeService>[] = [
  { header: "Service", accessorKey: "service_name", size: 220 },
  {
    header: "Requests",
    accessorKey: "request_count",
    meta: { align: "right" },
    size: 120,
    cell: ({ row: { original: row } }) => formatNumber(row.request_count),
  },
  {
    header: "Errors",
    accessorKey: "error_count",
    meta: { align: "right" },
    size: 100,
    cell: ({ row: { original: row } }) => formatNumber(row.error_count),
  },
  {
    header: "Error %",
    accessorKey: "error_rate",
    meta: { align: "right" },
    size: 100,
    cell: ({ row: { original: row } }) => `${row.error_rate.toFixed(2)}%`,
  },
  {
    header: "Avg latency",
    accessorKey: "avg_latency_ms",
    meta: { align: "right" },
    size: 130,
    cell: ({ row: { original: row } }) => fmtMs(row.avg_latency_ms),
  },
  {
    header: "p95",
    accessorKey: "p95_latency_ms",
    meta: { align: "right" },
    size: 110,
    cell: ({ row: { original: row } }) => fmtMs(row.p95_latency_ms),
  },
  {
    header: "Pods",
    accessorKey: "pod_count",
    meta: { align: "right" },
    size: 80,
    cell: ({ row: { original: row } }) => formatNumber(row.pod_count),
  },
];

function useHostNode(host: string): InfrastructureNode | null {
  const nodesQ = useTimeRangeQuery<readonly InfrastructureNode[]>(
    "host-detail.nodes-list",
    (_tenant, s, e) => getNodes(s, e)
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

interface HostServicesProps {
  readonly services: readonly InfrastructureNodeService[];
  readonly isPending: boolean;
}

function HostServices({ services, isPending }: HostServicesProps) {
  return (
    <section className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 font-semibold text-[13px] text-foreground">Services on this host</div>
      {services.length === 0 ? (
        <div className="grid h-[80px] place-items-center text-[12px] text-foreground-muted">
          {isPending
            ? "Loading services…"
            : "No instrumented services reported traffic from this host in the current time range."}
        </div>
      ) : (
        <DataTable
          data={{ columns: SERVICE_COLUMNS, rows: [...services] }}
          pagination={{ pageSize: 25 }}
        />
      )}
    </section>
  );
}

export default function HostDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const host = decodeURIComponent(typeof params.host === "string" ? params.host : "");
  const node = useHostNode(host);
  const status = statusFromNode(node);

  const overviewQ = useTimeRangeQuery(`host-detail.overview.${host}`, (_t, s, e) =>
    getHostOverview(host, s, e)
  );
  const overview = overviewQ.data ?? null;
  const availableMetrics = overview ? overview.available_metrics : null;

  const servicesQ = useTimeRangeQuery(`host-services-${host}`, (_t, s, e) =>
    getNodeServices(host, Number(s), Number(e))
  );
  const services = servicesQ.data ?? [];

  return (
    <PageShell>
      <HostDetailHero host={host} node={node} overview={overview} status={status} />
      <HostDetailKpiCards overview={overview} />
      <HostDetailAbout about={overview?.about} />
      <HostDetailSystemMetrics host={host} availableMetrics={availableMetrics} />
      <HostDetailNetwork host={host} availableMetrics={availableMetrics} />
      <HostServices services={services} isPending={servicesQ.isPending} />
      <HostDetailContainers host={host} />
      <HostDetailLogs host={host} />
    </PageShell>
  );
}
