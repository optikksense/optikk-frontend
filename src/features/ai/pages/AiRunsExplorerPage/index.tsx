import { Brain, Play } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ObservabilityDataBoard,
  PageHeader,
  PageShell,
  PageSurface,
  ObservabilityQueryBar,
} from '@shared/components/ui';
import {
  boardHeight,
  type RenderRowContext,
} from '@shared/components/ui/data-display/ObservabilityDataBoard';
import { type StructuredFilter } from '@shared/hooks/useURLFilters';
import { formatNumber } from '@shared/utils/formatters';

import { Badge, Select } from '@/components/ui';

import { AiRunsTableRow } from '../../components/runs/AiRunsTableRow';
import { useAiRunsExplorer } from '../../hooks/useAiRunsExplorer';
import { AI_RUN_COLUMNS, AI_RUN_FILTER_FIELDS } from '../../utils/aiRunsUtils';

import type { LLMRun } from '../../types';

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiRunsExplorerPage(): JSX.Element {
  const navigate = useNavigate();
  const {
    isLoading,
    runs,
    pageSize,
    filters,
    runsError,
    summaryError,
    modelsError,
    operationsError,
    hasError,
    primaryError,
    setPageSize,
    setFilters,
    clearAll,
  } = useAiRunsExplorer();

  const maxDuration = useMemo(() => Math.max(...runs.map((r) => r.durationMs), 1), [runs]);

  const onRowClick = useCallback(
    (spanId: string) => {
      navigate(`/ai-runs/${spanId}`);
    },
    [navigate]
  );

  return (
    <PageShell className="ai-runs-page">
      <PageHeader
        title="LLM Runs"
        icon={<Brain size={24} />}
        subtitle="Filter, compare, and inspect individual model calls in the same dense explorer rhythm as logs and traces."
      />

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Runs Explorer</Badge>
              <Badge variant={hasError ? 'error' : 'default'}>
                {formatNumber(runs.length)} runs in view
              </Badge>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Filter by model, operation, service, status, or trace identifiers.
            </div>
          </div>

          <div className="relative z-[70] min-w-[320px] max-w-4xl">
            <ObservabilityQueryBar
              fields={AI_RUN_FILTER_FIELDS}
              filters={filters as StructuredFilter[]}
              setFilters={(next: StructuredFilter[]) => setFilters(next)}
              onClearAll={clearAll}
              placeholder="Filter LLM runs by model, operation, provider, service, or status"
            />
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg" className="min-h-0">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Play size={15} />
              <span>LLM Run Explorer</span>
              <span className="inline-flex items-center rounded-full border border-[rgba(96,165,250,0.2)] bg-[rgba(96,165,250,0.1)] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-info)]">
                {formatNumber(runs.length)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Open a run to inspect prompts, token usage, latency, and downstream context.
            </p>
          </div>
        </div>

        {hasError ? (
          <div className="mb-4 rounded-xl border border-[rgba(240,68,56,0.22)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
            <strong className="text-sm">One or more LLM runs requests failed</strong>
            <div className="mt-1 text-[13px] leading-6">
              {[
                runsError ? `Runs: ${getErrorMessage(runsError, 'Unable to load runs.')}` : null,
                summaryError
                  ? `Summary: ${getErrorMessage(summaryError, 'Unable to load summary.')}`
                  : null,
                modelsError
                  ? `Models: ${getErrorMessage(modelsError, 'Unable to load models.')}`
                  : null,
                operationsError
                  ? `Operations: ${getErrorMessage(operationsError, 'Unable to load operations.')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' ')}
            </div>
          </div>
        ) : null}

        <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
          {runsError ? (
            <div className="p-6">
              <div className="rounded-xl border border-[rgba(240,68,56,0.22)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
                <strong className="text-sm">The LLM runs explorer could not load.</strong>
                <div className="mt-1 text-[13px] leading-6">
                  {getErrorMessage(primaryError, 'The backend request failed for this time range.')}
                </div>
              </div>
            </div>
          ) : (
            <ObservabilityDataBoard
              data={{ rows: runs, isLoading, serverTotal: runs.length }}
              config={{
                columns: AI_RUN_COLUMNS,
                rowKey: (run: LLMRun, index: number) => run.spanId || index,
                renderRow: (run: LLMRun, context: RenderRowContext) => (
                  <AiRunsTableRow
                    run={run}
                    colWidths={context.colWidths}
                    visibleCols={context.visibleCols}
                    maxDuration={maxDuration}
                    columns={AI_RUN_COLUMNS}
                    onRowClick={onRowClick}
                    onOpenDetail={() => {}}
                  />
                ),
                entityName: 'LLM run',
                storageKey: 'ai_runs_visible_cols_v1',
                emptyTips: [
                  {
                    num: 1,
                    text: (
                      <>
                        Widen the <strong>time range</strong> in the top bar
                      </>
                    ),
                  },
                  {
                    num: 2,
                    text: (
                      <>
                        Remove active <strong>filters</strong> from the query bar
                      </>
                    ),
                  },
                  {
                    num: 3,
                    text: (
                      <>
                        Ensure your services are instrumented with <strong>OpenLLMetry</strong>
                      </>
                    ),
                  },
                ],
              }}
            />
          )}
        </div>

        {!isLoading && !runsError && runs.length > 0 ? (
          <div className="mt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-4">
            <span className="text-xs text-[var(--text-muted)]">
              Showing {formatNumber(runs.length)} runs
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Density
              </span>
              <Select
                size="sm"
                value={pageSize}
                onChange={(value: number) => setPageSize(value)}
                options={[25, 50, 100].map((v) => ({ label: `${v} / page`, value: v }))}
                className="w-[110px]"
              />
            </div>
          </div>
        ) : null}
      </PageSurface>
    </PageShell>
  );
}
