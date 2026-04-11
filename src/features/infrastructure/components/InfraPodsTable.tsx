import {
  Badge,
  Button,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { formatNumber, formatPercentage, formatRelativeTime } from "@shared/utils/formatters";

import type { FleetPod } from "../types";
import { tierForPod } from "../utils/podHealth";

const TIER_BADGE: Record<ReturnType<typeof tierForPod>, "success" | "warning" | "error"> = {
  healthy: "success",
  degraded: "warning",
  unhealthy: "error",
};

interface InfraPodsTableProps {
  readonly pods: readonly FleetPod[];
  readonly onOpenPodLogs: (podName: string) => void;
}

export default function InfraPodsTable({ pods, onOpenPodLogs }: InfraPodsTableProps) {
  const columns: SimpleTableColumn<FleetPod>[] = [
    {
      key: "pod_name",
      title: "Pod",
      dataIndex: "pod_name",
      sorter: (a, b) => a.pod_name.localeCompare(b.pod_name),
      render: (_v, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.pod_name}</span>
      ),
    },
    {
      key: "host",
      title: "Host",
      dataIndex: "host",
      sorter: (a, b) => a.host.localeCompare(b.host),
    },
    {
      key: "health",
      title: "Health",
      sorter: (a, b) => {
        const o = { healthy: 0, degraded: 1, unhealthy: 2 };
        return o[tierForPod(a)] - o[tierForPod(b)];
      },
      render: (_v, row) => {
        const t = tierForPod(row);
        return <Badge variant={TIER_BADGE[t]}>{t}</Badge>;
      },
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
    {
      key: "logs",
      title: "",
      width: 100,
      render: (_v, row) => (
        <Button variant="ghost" size="sm" onClick={() => onOpenPodLogs(row.pod_name)}>
          Logs
        </Button>
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      dataSource={[...pods]}
      rowKey={(row) => `${row.pod_name}\0${row.host}`}
      pagination={{ pageSize: 15, showSizeChanger: true }}
      scroll={{ x: 960 }}
    />
  );
}
