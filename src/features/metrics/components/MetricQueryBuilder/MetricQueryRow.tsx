import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { QUERY_LABEL_COLORS } from '../../constants';
import type {
  MetricAggregation,
  MetricQueryDefinition,
  MetricTagFilter,
} from '../../types';
import { AggregationPicker } from './AggregationPicker';
import { MetricSelector } from './MetricSelector';
import { TagFilter } from './TagFilter';
import { TagGroupBy } from './TagGroupBy';

interface MetricQueryRowProps {
  readonly query: MetricQueryDefinition;
  readonly canRemove: boolean;
  readonly onAggregationChange: (agg: MetricAggregation) => void;
  readonly onMetricChange: (metricName: string) => void;
  readonly onWhereChange: (filters: MetricTagFilter[]) => void;
  readonly onGroupByChange: (groupBy: string[]) => void;
  readonly onRemove: () => void;
}

export function MetricQueryRow({
  query,
  canRemove,
  onAggregationChange,
  onMetricChange,
  onWhereChange,
  onGroupByChange,
  onRemove,
}: MetricQueryRowProps) {
  const labelColor = QUERY_LABEL_COLORS[query.id] ?? '#6b7280';

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border border-[var(--border-color)]',
        'bg-[var(--bg-secondary)] px-3 py-2 min-h-[48px]',
        'transition-colors duration-150',
        'hover:border-[rgba(148,163,184,0.25)]'
      )}
    >
      {/* Query label */}
      <div
        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
        style={{ backgroundColor: labelColor }}
      >
        {query.id}
      </div>

      {/* Query controls */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Row 1: Aggregation + Metric */}
        <div className="flex items-center gap-2">
          <AggregationPicker value={query.aggregation} onChange={onAggregationChange} />
          <MetricSelector value={query.metricName} onChange={onMetricChange} />
        </div>

        {/* Row 2: Where + Group By (only shown when metric is selected) */}
        {query.metricName && (
          <div className="flex items-center gap-3 flex-wrap">
            <TagFilter
              metricName={query.metricName}
              filters={[...query.where]}
              onChange={onWhereChange}
            />
            <div className="h-4 w-px bg-[var(--border-color)]" />
            <TagGroupBy
              metricName={query.metricName}
              groupBy={[...query.groupBy]}
              onChange={onGroupByChange}
            />
          </div>
        )}
      </div>

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-1 shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 hover:bg-[var(--bg-hover)] transition-all duration-100"
        >
          <X size={14} className="text-[var(--text-muted)]" />
        </button>
      )}
    </div>
  );
}
