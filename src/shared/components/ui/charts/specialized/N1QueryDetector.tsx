/**
 * Fix 18: N1QueryDetector
 * Highlights services/operations making an unusually high number of repeated
 * DB queries — the classic N+1 pattern.
 * Data comes from the /api/v1/spans/n1 endpoint (aggregated query counts).
 */
import { Badge, SimpleTable, Surface, Tooltip } from "@/components/ui";
import type React from "react";

/**
 *
 */
export interface N1QueryRow {
  service: string;
  operation: string;
  queryPattern: string;
  callCount: number; // number of times this query ran in the window
  distinctCallers: number; // unique parent spans that triggered it
  avgLatencyMs: number;
  p99LatencyMs: number;
}

interface N1QueryDetectorProps {
  data: N1QueryRow[];
  loading?: boolean;
  title?: string;
  /** Threshold above which a call count is flagged as N+1. Default 20. */
  threshold?: number;
}

const N1QueryDetector: React.FC<N1QueryDetectorProps> = ({
  data,
  loading = false,
  title = "N+1 Query Detector",
  threshold = 20,
}) => {
  const columns = [
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      width: 120,
      render: (v: any) => (
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
          {v}
        </span>
      ),
    },
    {
      title: "Operation",
      dataIndex: "operation",
      key: "operation",
      width: 140,
      render: (v: any) => (
        <code style={{ fontSize: "var(--text-xs)", color: "var(--color-info)" }}>{v}</code>
      ),
    },
    {
      title: "Query Pattern",
      dataIndex: "queryPattern",
      key: "queryPattern",
      ellipsis: true,
      render: (v: any) => (
        <Tooltip content={v}>
          <code style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{v}</code>
        </Tooltip>
      ),
    },
    {
      title: "Calls",
      dataIndex: "callCount",
      key: "callCount",
      width: 80,
      sorter: (a: any, b: any) => b.callCount - a.callCount,
      defaultSortOrder: "ascend" as const,
      render: (v: any) => (
        <Badge
          color={v >= threshold ? "var(--severity-critical)" : "var(--severity-medium)"}
          style={{
            background:
              v >= threshold ? "var(--severity-critical-subtle)" : "var(--severity-medium-subtle)",
            border: `1px solid ${v >= threshold ? "var(--severity-critical)" : "var(--severity-medium)"}`,
            color: v >= threshold ? "var(--severity-critical)" : "var(--severity-medium)",
            fontWeight: 600,
          }}
        >
          {v}
        </Badge>
      ),
    },
    {
      title: "Callers",
      dataIndex: "distinctCallers",
      key: "distinctCallers",
      width: 80,
      render: (v: any) => (
        <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{v}</span>
      ),
    },
    {
      title: "Avg (ms)",
      dataIndex: "avgLatencyMs",
      key: "avgLatencyMs",
      width: 90,
      render: (v: any) => (
        <span
          style={{
            color: v > 100 ? "var(--severity-high)" : "var(--text-secondary)",
            fontSize: "var(--text-sm)",
          }}
        >
          {Number(v).toFixed(1)}
        </span>
      ),
    },
    {
      title: "p99 (ms)",
      dataIndex: "p99LatencyMs",
      key: "p99LatencyMs",
      width: 90,
      render: (v: any) => (
        <span
          style={{
            color: v > 500 ? "var(--severity-critical)" : "var(--text-secondary)",
            fontSize: "var(--text-sm)",
          }}
        >
          {Number(v).toFixed(1)}
        </span>
      ),
    },
  ];

  return (
    <Surface className="chart-card" padding="sm">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {loading ? (
        <div className="py-8 text-center text-[var(--text-muted)]">Loading...</div>
      ) : (
        <SimpleTable
          dataSource={data}
          columns={columns}
          rowKey={(r: any) => `${r.service}::${r.operation}::${r.queryPattern}`}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      )}
    </Surface>
  );
};

export default N1QueryDetector;
