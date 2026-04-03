import { useState, useMemo } from 'react';

import { Surface, Skeleton } from '@/components/ui';
import SparklineChart from '@shared/components/ui/charts/micro/SparklineChart';
import { APP_COLORS } from '@config/colorLiterals';

import type { ServiceErrorGroup } from '../../types';

type SortField = 'errorCount' | 'lastOccurrence' | 'statusMessage';
type SortDir = 'asc' | 'desc';

interface ServiceErrorTrackingProps {
  errorGroups: ServiceErrorGroup[];
  loading: boolean;
}

function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return '—';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ServiceErrorTracking({
  errorGroups,
  loading,
}: ServiceErrorTrackingProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('errorCount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    const copy = [...errorGroups];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'errorCount':
          cmp = a.errorCount - b.errorCount;
          break;
        case 'lastOccurrence':
          cmp = new Date(a.lastOccurrence).getTime() - new Date(b.lastOccurrence).getTime();
          break;
        case 'statusMessage':
          cmp = a.statusMessage.localeCompare(b.statusMessage);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return copy;
  }, [errorGroups, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const totalErrors = useMemo(
    () => errorGroups.reduce((sum, eg) => sum + eg.errorCount, 0),
    [errorGroups]
  );

  if (loading) return <Skeleton count={5} />;

  if (errorGroups.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
        No errors in selected time range
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)]">
        <span>
          <strong className="text-red-400">{totalErrors.toLocaleString()}</strong> total errors
        </span>
        <span>
          <strong>{errorGroups.length}</strong> error groups
        </span>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 text-[10px]">
        {(['errorCount', 'lastOccurrence', 'statusMessage'] as SortField[]).map((field) => (
          <button
            key={field}
            onClick={() => handleSort(field)}
            className={`rounded px-2 py-1 transition-colors ${
              sortField === field
                ? 'bg-[rgba(124,127,242,0.15)] text-[var(--color-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {field === 'errorCount' ? 'Count' : field === 'lastOccurrence' ? 'Recent' : 'Name'}
            {sortField === field && (sortDir === 'desc' ? ' ↓' : ' ↑')}
          </button>
        ))}
      </div>

      {/* Error groups list */}
      <div className="space-y-2">
        {sorted.map((eg) => {
          const id = `${eg.statusMessage}-${eg.httpStatusCode}-${eg.operationName}`;
          const isExpanded = expandedId === id;
          // Generate a fake sparkline from error count (for now; real timeseries in backend Phase 2.7)
          const sparkline = Array.from({ length: 12 }, () =>
            Math.floor(Math.random() * eg.errorCount * 0.3)
          );

          return (
            <Surface key={id} elevation={1} padding="sm">
              <div
                className="flex cursor-pointer items-center gap-4"
                onClick={() => setExpandedId(isExpanded ? null : id)}
              >
                {/* Error info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                      {eg.httpStatusCode || 'ERR'}
                    </span>
                    <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {eg.statusMessage || 'Unknown Error'}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    {eg.operationName}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="hidden sm:block">
                  <SparklineChart
                    data={sparkline}
                    color={APP_COLORS.hex_ff4d5a}
                    width={80}
                    height={22}
                  />
                </div>

                {/* Count */}
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-red-400">
                    {eg.errorCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">errors</div>
                </div>

                {/* Timing */}
                <div className="hidden text-right text-[11px] text-[var(--text-muted)] md:block" style={{ minWidth: 70 }}>
                  <div>Last: {formatTimeAgo(eg.lastOccurrence)}</div>
                  <div>First: {formatTimeAgo(eg.firstOccurrence)}</div>
                </div>

                {/* Expand chevron */}
                <span className="text-[var(--text-muted)] transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                  ▸
                </span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-3 border-t border-[var(--border-color)] pt-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)]">HTTP Status:</span>{' '}
                      <span className="text-[var(--text-primary)]">{eg.httpStatusCode || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Operation:</span>{' '}
                      <span className="font-mono text-[var(--text-primary)]">{eg.operationName}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">First Seen:</span>{' '}
                      <span className="text-[var(--text-primary)]">
                        {eg.firstOccurrence ? new Date(eg.firstOccurrence).toLocaleString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Last Seen:</span>{' '}
                      <span className="text-[var(--text-primary)]">
                        {eg.lastOccurrence ? new Date(eg.lastOccurrence).toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>
                  {eg.sampleTraceId && (
                    <div className="mt-3">
                      <a
                        href={`/traces/${eg.sampleTraceId}`}
                        className="inline-flex items-center gap-1 rounded bg-[rgba(124,127,242,0.12)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[rgba(124,127,242,0.2)]"
                      >
                        View Sample Trace →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
