import { useMemo, useState } from 'react';

import { Surface, Skeleton } from '@/components/ui';
import DataTable from '@shared/components/ui/data-display/DataTable';
import type { SimpleTableColumn } from '@shared/components/primitives/ui/simple-table';

import type { SpanAnalysisEntry } from '../../types';

function formatMs(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

function formatDuration(ms: number): string {
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`;
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${ms.toFixed(0)}ms`;
}

const KIND_COLORS: Record<string, string> = {
  server: 'bg-blue-500/20 text-blue-400',
  client: 'bg-green-500/20 text-green-400',
  internal: 'bg-gray-500/20 text-gray-400',
  producer: 'bg-orange-500/20 text-orange-400',
  consumer: 'bg-purple-500/20 text-purple-400',
  unknown: 'bg-gray-500/20 text-gray-400',
};

interface ServiceSpanAnalysisProps {
  spans: SpanAnalysisEntry[];
  loading: boolean;
}

export default function ServiceSpanAnalysis({ spans, loading }: ServiceSpanAnalysisProps) {
  const [filter, setFilter] = useState<string>('all');

  const totalDuration = useMemo(
    () => spans.reduce((sum, s) => sum + s.totalDurationMs, 0),
    [spans]
  );

  const kindBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; duration: number }>();
    for (const s of spans) {
      const existing = map.get(s.spanKind) ?? { count: 0, duration: 0 };
      map.set(s.spanKind, {
        count: existing.count + s.spanCount,
        duration: existing.duration + s.totalDurationMs,
      });
    }
    return Array.from(map.entries()).sort((a, b) => b[1].duration - a[1].duration);
  }, [spans]);

  const filtered = useMemo(
    () => (filter === 'all' ? spans : spans.filter((s) => s.spanKind === filter)),
    [spans, filter]
  );

  const columns: SimpleTableColumn<SpanAnalysisEntry>[] = useMemo(
    () => [
      {
        title: 'Operation',
        dataIndex: 'operationName',
        key: 'operation',
        ellipsis: true,
        width: '30%',
        render: (_: unknown, row: SpanAnalysisEntry) => (
          <div className="flex items-center gap-2">
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${KIND_COLORS[row.spanKind] ?? KIND_COLORS.unknown}`}>
              {row.spanKind}
            </span>
            <span className="truncate font-mono text-xs">{row.operationName}</span>
          </div>
        ),
        sorter: (a: SpanAnalysisEntry, b: SpanAnalysisEntry) =>
          a.operationName.localeCompare(b.operationName),
      },
      {
        title: 'Spans',
        dataIndex: 'spanCount',
        key: 'count',
        align: 'right' as const,
        width: 80,
        render: (_: unknown, row: SpanAnalysisEntry) => (
          <span className="font-mono text-xs">{row.spanCount.toLocaleString()}</span>
        ),
        sorter: (a: SpanAnalysisEntry, b: SpanAnalysisEntry) => a.spanCount - b.spanCount,
      },
      {
        title: 'Total Time',
        dataIndex: 'totalDurationMs',
        key: 'total',
        align: 'right' as const,
        width: 110,
        render: (_: unknown, row: SpanAnalysisEntry) => {
          const pct = totalDuration > 0 ? (row.totalDurationMs / totalDuration) * 100 : 0;
          return (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-tertiary)]" style={{ minWidth: 40 }}>
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs">{formatDuration(row.totalDurationMs)}</span>
            </div>
          );
        },
        sorter: (a: SpanAnalysisEntry, b: SpanAnalysisEntry) => a.totalDurationMs - b.totalDurationMs,
        defaultSortOrder: 'descend' as const,
      },
      {
        title: 'Avg',
        dataIndex: 'avgDurationMs',
        key: 'avg',
        align: 'right' as const,
        width: 80,
        render: (_: unknown, row: SpanAnalysisEntry) => (
          <span className="font-mono text-xs">{formatMs(row.avgDurationMs)}</span>
        ),
        sorter: (a: SpanAnalysisEntry, b: SpanAnalysisEntry) => a.avgDurationMs - b.avgDurationMs,
      },
      {
        title: 'P95',
        dataIndex: 'p95DurationMs',
        key: 'p95',
        align: 'right' as const,
        width: 80,
        render: (_: unknown, row: SpanAnalysisEntry) => (
          <span className="font-mono text-xs">{formatMs(row.p95DurationMs)}</span>
        ),
        sorter: (a: SpanAnalysisEntry, b: SpanAnalysisEntry) => a.p95DurationMs - b.p95DurationMs,
      },
      {
        title: 'Errors',
        dataIndex: 'errorRate',
        key: 'errors',
        align: 'right' as const,
        width: 80,
        render: (_: unknown, row: SpanAnalysisEntry) => (
          <span className={`font-mono text-xs ${row.errorRate > 5 ? 'text-red-400' : row.errorRate > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
            {row.errorRate.toFixed(1)}%
          </span>
        ),
        sorter: (a: SpanAnalysisEntry, b: SpanAnalysisEntry) => a.errorRate - b.errorRate,
      },
    ],
    [totalDuration]
  );

  if (loading) return <Skeleton count={6} />;

  if (spans.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
        No span data in selected time range
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kind breakdown summary */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[rgba(124,127,242,0.15)] text-[var(--color-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          All ({spans.length})
        </button>
        {kindBreakdown.map(([kind, data]) => (
          <button
            key={kind}
            onClick={() => setFilter(kind)}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              filter === kind
                ? 'bg-[rgba(124,127,242,0.15)] text-[var(--color-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {kind} ({data.count.toLocaleString()}) · {formatDuration(data.duration)}
          </button>
        ))}
      </div>

      <DataTable
        data={{
          columns,
          rows: filtered,
          rowKey: (row: SpanAnalysisEntry) => `${row.spanKind}::${row.operationName}`,
        }}
        pagination={{ showPagination: filtered.length > 20, pageSize: 20 }}
      />
    </div>
  );
}
