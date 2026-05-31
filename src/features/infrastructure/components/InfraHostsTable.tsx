import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { ServiceAvatar } from "@/features/services/components/ServiceAvatar";

import type { InfrastructureNode } from "../types";
import { tierForNode } from "../utils/nodeHealth";

const STATUS_DOT: Record<ReturnType<typeof tierForNode>, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  unhealthy: "bg-error",
};

function StatusDot({ node }: { node: InfrastructureNode }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[tierForNode(node)]}`}
    />
  );
}

function HostCell({ node }: { node: InfrastructureNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <StatusDot node={node} />
      <ServiceAvatar serviceName={node.host} size={26} />
      <span className="truncate font-mono font-semibold text-[12.5px] text-foreground">
        {node.host}
      </span>
    </div>
  );
}

function ServicesCell({ node }: { node: InfrastructureNode }) {
  if (node.services.length === 0) {
    return <span className="text-foreground-muted">—</span>;
  }
  const primary = node.services[0];
  const rest = node.services.length > 1 ? ` +${node.services.length - 1}` : "";
  return (
    <span className="truncate text-[12px] text-foreground">
      <span className="font-medium">{primary}</span>
      {rest && <span className="text-foreground-muted">{rest}</span>}
    </span>
  );
}

function ErrorRateCell({ rate }: { rate: number }) {
  const tone = rate >= 10 ? "text-error" : rate >= 2 ? "text-warning" : "text-foreground";
  return <span className={tone}>{formatPercentage(rate)}</span>;
}

interface InfraHostsTableProps {
  readonly nodes: readonly InfrastructureNode[];
  readonly onOpenNode: (host: string) => void;
}

const COLUMNS = (onOpenNode: (host: string) => void): SimpleTableColumn<InfrastructureNode>[] => [
  {
    key: "host",
    title: "Host",
    width: 320,
    sorter: (a, b) => a.host.localeCompare(b.host),
    render: (_v, row) => <HostCell node={row} />,
  },
  {
    key: "services",
    title: "Role · service",
    width: 220,
    render: (_v, row) => <ServicesCell node={row} />,
  },
  {
    key: "pod_count",
    title: "Pods",
    align: "right",
    width: 80,
    sorter: (a, b) => a.pod_count - b.pod_count,
    render: (_v, row) => (
      <span className="font-mono text-[12px]">{formatNumber(row.pod_count)}</span>
    ),
  },
  {
    key: "request_count",
    title: "Requests",
    align: "right",
    width: 110,
    sorter: (a, b) => a.request_count - b.request_count,
    defaultSortOrder: "descend",
    render: (_v, row) => (
      <span className="font-mono text-[12px]">{formatNumber(row.request_count)}</span>
    ),
  },
  {
    key: "error_rate",
    title: "Error %",
    align: "right",
    width: 100,
    sorter: (a, b) => a.error_rate - b.error_rate,
    render: (_v, row) => <ErrorRateCell rate={row.error_rate} />,
  },
  {
    key: "p95_latency_ms",
    title: "p95",
    align: "right",
    width: 100,
    sorter: (a, b) => a.p95_latency_ms - b.p95_latency_ms,
    render: (_v, row) => (
      <span className="font-mono text-[12px]">{formatDuration(row.p95_latency_ms)}</span>
    ),
  },
  {
    key: "open",
    title: "",
    width: 60,
    render: (_v, row) => (
      <button
        type="button"
        onClick={(ev) => {
          ev.stopPropagation();
          onOpenNode(row.host);
        }}
        className="text-[11px] text-primary hover:underline"
      >
        Open →
      </button>
    ),
  },
];

export function InfraHostsTable({ nodes, onOpenNode }: InfraHostsTableProps) {
  return (
    <SimpleTable
      columns={COLUMNS(onOpenNode)}
      dataSource={[...nodes]}
      rowKey={(r) => r.host}
      pagination={{ pageSize: 25 }}
      onRow={(record) => ({
        onClick: () => onOpenNode(record.host),
        style: { cursor: "pointer" },
      })}
    />
  );
}
