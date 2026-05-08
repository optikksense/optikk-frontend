import { SimpleTable } from "@/components/ui";

import type { SlowQueryPatternRow } from "../../api/databaseSlowQueriesApi";

interface Props {
  readonly rows: readonly SlowQueryPatternRow[];
  readonly onSelect: (row: SlowQueryPatternRow) => void;
  readonly loading?: boolean;
}

function fmtMs(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function fmtCount(v: number | null | undefined): string {
  if (v == null) return "0";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(v);
}

function truncQuery(text: string): string {
  if (text.length <= 80) return text;
  return `${text.slice(0, 78)}…`;
}

const columns = [
  {
    title: "Query",
    dataIndex: "query_text",
    key: "query_text",
    width: "44%",
    render: (v: unknown) => (
      <span className="font-mono text-[12px] text-[var(--text-primary)]">
        {truncQuery(String(v ?? ""))}
      </span>
    ),
  },
  {
    title: "Collection",
    dataIndex: "collection_name",
    key: "collection_name",
    width: "16%",
    render: (v: unknown) => (
      <span className="text-[12px] text-[var(--text-secondary)]">{String(v ?? "—")}</span>
    ),
  },
  {
    title: "Calls",
    dataIndex: "call_count",
    key: "call_count",
    align: "right" as const,
    width: "10%",
    sorter: (a: SlowQueryPatternRow, b: SlowQueryPatternRow) => a.call_count - b.call_count,
    render: (v: unknown) => fmtCount(Number(v ?? 0)),
  },
  {
    title: "Errors",
    dataIndex: "error_count",
    key: "error_count",
    align: "right" as const,
    width: "10%",
    sorter: (a: SlowQueryPatternRow, b: SlowQueryPatternRow) => a.error_count - b.error_count,
    render: (v: unknown) => fmtCount(Number(v ?? 0)),
  },
  {
    title: "p95",
    dataIndex: "p95_ms",
    key: "p95_ms",
    align: "right" as const,
    width: "10%",
    sorter: (a: SlowQueryPatternRow, b: SlowQueryPatternRow) => (a.p95_ms ?? 0) - (b.p95_ms ?? 0),
    render: (v: unknown) => fmtMs(v as number | null),
  },
  {
    title: "p99",
    dataIndex: "p99_ms",
    key: "p99_ms",
    align: "right" as const,
    width: "10%",
    sorter: (a: SlowQueryPatternRow, b: SlowQueryPatternRow) => (a.p99_ms ?? 0) - (b.p99_ms ?? 0),
    defaultSortOrder: "descend" as const,
    render: (v: unknown) => fmtMs(v as number | null),
  },
];

export function QueryListTable({ rows, loading, onSelect }: Props) {
  return (
    <SimpleTable<SlowQueryPatternRow>
      columns={columns}
      dataSource={rows as SlowQueryPatternRow[]}
      rowKey={(r: SlowQueryPatternRow) => `${r.collection_name}::${r.query_text}`}
      onRow={(record: SlowQueryPatternRow) => ({
        onClick: () => onSelect(record),
        style: { cursor: "pointer" },
      })}
    />
  );
}
