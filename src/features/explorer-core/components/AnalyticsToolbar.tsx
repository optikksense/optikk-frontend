import { BarChart3, LayoutList, LineChart, PieChart, Table2 } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

import type { QueryFieldOption } from '../constants/fields';

export type ExplorerVizMode = 'list' | 'timeseries' | 'toplist' | 'table' | 'piechart';

export interface AggregationSpec {
  function: string;
  field?: string;
  alias: string;
}

const STEP_OPTIONS = ['1m', '5m', '15m', '1h', '1d'] as const;

const AGG_FUNCS = ['count', 'avg', 'sum', 'min', 'max', 'p50', 'p95', 'p99'] as const;

interface AnalyticsToolbarProps {
  mode: 'list' | 'analytics';
  onModeChange: (mode: 'list' | 'analytics') => void;
  vizMode: ExplorerVizMode;
  onVizModeChange: (v: ExplorerVizMode) => void;
  groupBy: string[];
  onGroupByChange: (g: string[]) => void;
  aggregations: AggregationSpec[];
  onAggregationsChange: (a: AggregationSpec[]) => void;
  step: string;
  onStepChange: (s: string) => void;
  fieldOptions: readonly QueryFieldOption[];
  metricFields: { value: string; label: string }[];
  className?: string;
}

export function AnalyticsToolbar({
  mode,
  onModeChange,
  vizMode,
  onVizModeChange,
  groupBy,
  onGroupByChange,
  aggregations,
  onAggregationsChange,
  step,
  onStepChange,
  fieldOptions,
  metricFields,
  className = '',
}: AnalyticsToolbarProps): JSX.Element {
  const setGroupAt = (index: number, value: string): void => {
    const next = [...groupBy];
    next[index] = value;
    onGroupByChange(next.filter(Boolean));
  };

  const addGroup = (): void => {
    if (groupBy.length >= 4) return;
    onGroupByChange([...groupBy, fieldOptions[0]?.name ?? 'service']);
  };

  const removeGroup = (index: number): void => {
    onGroupByChange(groupBy.filter((_, i) => i !== index));
  };

  const addAgg = (): void => {
    if (aggregations.length >= 8) return;
    onAggregationsChange([
      ...aggregations,
      { function: 'count', alias: `m${aggregations.length + 1}` },
    ]);
  };

  const setAgg = (index: number, patch: Partial<AggregationSpec>): void => {
    const next = aggregations.map((a, i) => (i === index ? { ...a, ...patch } : a));
    onAggregationsChange(next);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          View
        </span>
        <div className="inline-flex rounded-lg border border-[var(--border-color)] p-0.5">
          <Button
            type="button"
            variant={mode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onModeChange('list')}
          >
            <LayoutList size={14} className="mr-1" /> List
          </Button>
          <Button
            type="button"
            variant={mode === 'analytics' ? 'primary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onModeChange('analytics')}
          >
            <BarChart3 size={14} className="mr-1" /> Analytics
          </Button>
        </div>
      </div>

      {mode === 'analytics' ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Group by
            </span>
            {groupBy.map((g, i) => (
              <div key={`g-${i}`} className="flex items-center gap-1">
                <select
                  className="h-8 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 text-[12px] text-[var(--text-primary)]"
                  value={g}
                  onChange={(e) => setGroupAt(i, e.target.value)}
                >
                  {fieldOptions.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--color-error)]"
                  onClick={() => removeGroup(i)}
                >
                  ×
                </button>
              </div>
            ))}
            {groupBy.length < 4 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8"
                onClick={addGroup}
              >
                + Dimension
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Metrics
            </span>
            {aggregations.map((agg, i) => (
              <div key={`a-${i}`} className="flex flex-wrap items-center gap-1">
                <select
                  className="h-8 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 text-[12px]"
                  value={agg.function}
                  onChange={(e) => setAgg(i, { function: e.target.value })}
                >
                  {AGG_FUNCS.map((fn) => (
                    <option key={fn} value={fn}>
                      {fn}
                    </option>
                  ))}
                </select>
                <select
                  className="h-8 max-w-[140px] rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 text-[12px]"
                  value={agg.field ?? ''}
                  onChange={(e) => setAgg(i, { field: e.target.value || undefined })}
                >
                  <option value="">(auto)</option>
                  {metricFields.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <input
                  className="h-8 w-24 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 font-mono text-[11px]"
                  title="Alias"
                  value={agg.alias}
                  onChange={(e) => setAgg(i, { alias: e.target.value })}
                />
              </div>
            ))}
            {aggregations.length < 8 ? (
              <Button type="button" variant="secondary" size="sm" className="h-8" onClick={addAgg}>
                + Aggregation
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Viz
            </span>
            {(
              [
                ['list', LayoutList, 'List'],
                ['timeseries', LineChart, 'Timeseries'],
                ['toplist', BarChart3, 'Top list'],
                ['table', Table2, 'Table'],
                ['piechart', PieChart, 'Pie'],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                title={label}
                onClick={() => onVizModeChange(key as ExplorerVizMode)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                  vizMode === key
                    ? 'border-[rgba(77,166,200,0.45)] bg-[rgba(77,166,200,0.14)] text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-color)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon size={16} />
              </button>
            ))}
            {vizMode === 'timeseries' ? (
              <select
                className="ml-2 h-8 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 text-[12px]"
                value={step}
                onChange={(e) => onStepChange(e.target.value)}
              >
                {STEP_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
