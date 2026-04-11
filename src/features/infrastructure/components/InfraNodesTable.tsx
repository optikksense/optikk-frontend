import {
  Badge,
  Button,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { formatNumber, formatPercentage, formatRelativeTime } from "@shared/utils/formatters";

import type { InfrastructureNode } from "../types";
import { tierForNode } from "../utils/nodeHealth";

const TIER_BADGE: Record<ReturnType<typeof tierForNode>, "success" | "warning" | "error"> = {
  healthy: "success",
  degraded: "warning",
  unhealthy: "error",
};

interface InfraNodesTableProps {
  readonly nodes: readonly InfrastructureNode[];
  readonly onOpenNode: (host: string) => void;
  readonly onOpenHostLogs?: (host: string) => void;
}

export default function InfraNodesTable({
  nodes,
  onOpenNode,
  onOpenHostLogs,
}: InfraNodesTableProps) {
  const columns: SimpleTableColumn<InfrastructureNode>[] = [
    {
      key: "host",
      title: "Host",
      dataIndex: "host",
      sorter: (a, b) => a.host.localeCompare(b.host),
      render: (_v, row) => (
        <button
          type="button"
          className="text-left font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => onOpenNode(row.host)}
        >
          {row.host}
        </button>
      ),
    },
    {
      key: "health",
      title: "Health",
      sorter: (a, b) => {
        const o = { healthy: 0, degraded: 1, unhealthy: 2 };
        return o[tierForNode(a)] - o[tierForNode(b)];
      },
      render: (_v, row) => {
        const t = tierForNode(row);
        return <Badge variant={TIER_BADGE[t]}>{t}</Badge>;
      },
    },
    {
      key: "pod_count",
      title: "Pods",
      dataIndex: "pod_count",
      sorter: (a, b) => a.pod_count - b.pod_count,
      render: (v) => formatNumber(Number(v)),
    },
    {
      key: "request_count",
      title: "Requests",
      dataIndex: "request_count",
      sorter: (a, b) => a.request_count - b.request_count,
      defaultSortOrder: "descend",
      render: (v) => formatNumber(Number(v)),
    },
    {
      key: "error_rate",
      title: "Error rate",
      dataIndex: "error_rate",
      sorter: (a, b) => a.error_rate - b.error_rate,
      render: (v) => formatPercentage(Number(v)),
    },
    {
      key: "avg_latency_ms",
      title: "Avg latency",
      dataIndex: "avg_latency_ms",
      sorter: (a, b) => a.avg_latency_ms - b.avg_latency_ms,
      render: (v) => `${formatNumber(Number(v))} ms`,
    },
    {
      key: "last_seen",
      title: "Last seen",
      dataIndex: "last_seen",
      render: (v) => formatRelativeTime(String(v)),
    },
    ...(onOpenHostLogs
      ? ([
          {
            key: "logs",
            title: "",
            width: 100,
            render: (_v: unknown, row: InfrastructureNode) => (
              <Button variant="ghost" size="sm" onClick={() => onOpenHostLogs(row.host)}>
                Logs
              </Button>
            ),
          },
        ] satisfies SimpleTableColumn<InfrastructureNode>[])
      : []),
  ];

  return (
    <SimpleTable
      columns={columns}
      dataSource={[...nodes]}
      rowKey="host"
      pagination={{ pageSize: 15, showSizeChanger: true }}
      scroll={{ x: 900 }}
    />
  );
}
