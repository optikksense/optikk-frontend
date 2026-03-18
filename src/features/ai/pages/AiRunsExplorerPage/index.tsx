import { Alert, Select } from 'antd';
import { Brain, Play } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PageHeader,
  ObservabilityQueryBar,
  ObservabilityDataBoard,
  boardHeight,
} from '@shared/components/ui';
import { type StructuredFilter } from '@shared/hooks/useURLFilters';
import { formatNumber } from '@shared/utils/formatters';
import { EntityExplorerLayout } from '@/shared/components/layout/EntityExplorerLayout';

import { useAiRunsExplorer } from '../../hooks/useAiRunsExplorer';
import { AiRunsKpiRow } from '../../components/runs/AiRunsKpiRow';
import { AiRunsTableRow } from '../../components/runs/AiRunsTableRow';
import { AI_RUN_FILTER_FIELDS, AI_RUN_COLUMNS } from '../../utils/aiRunsUtils';
import type { LLMRun } from '../../types';

import './AiRunsExplorerPage.css';

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
    isSummaryLoading,
    runs,
    summary,
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

  const maxDuration = useMemo(
    () => Math.max(...runs.map((r) => r.durationMs), 1),
    [runs],
  );

  const onRowClick = useCallback(
    (spanId: string) => {
      navigate(`/ai-runs/${spanId}`);
    },
    [navigate, runs],
  );

  return (
    <EntityExplorerLayout
      className="ai-runs-page"
      header={<PageHeader title="LLM Runs" icon={<Brain size={24} />} />}
      kpiRow={
        <AiRunsKpiRow
          summary={summary}
          isLoading={isSummaryLoading}
          hasError={Boolean(summaryError)}
        />
      }
      tableSection={
        <div className="traces-table-card">
          <div className="traces-table-card-header">
            <span className="traces-table-card-title">
              <Play size={15} />
              LLM Run Explorer
              <span className="traces-count-badge">
                {formatNumber(runs.length)}
              </span>
            </span>
          </div>

          {hasError && (
            <div style={{ padding: '12px 18px 0 18px' }}>
              <Alert
                type="error"
                showIcon
                message="One or more LLM Runs requests failed"
                description={[
                  runsError ? `Runs: ${getErrorMessage(runsError, 'Unable to load runs.')}` : null,
                  summaryError ? `Summary: ${getErrorMessage(summaryError, 'Unable to load summary.')}` : null,
                  modelsError ? `Models: ${getErrorMessage(modelsError, 'Unable to load models.')}` : null,
                  operationsError ? `Operations: ${getErrorMessage(operationsError, 'Unable to load operations.')}` : null,
                ].filter(Boolean).join(' ')}
              />
            </div>
          )}

          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
            <ObservabilityQueryBar
              fields={AI_RUN_FILTER_FIELDS}
              filters={filters as StructuredFilter[]}
              setFilters={(next: StructuredFilter[]) => setFilters(next)}
              searchText=""
              setSearchText={() => {}}
              onClearAll={clearAll}
              placeholder="Filter by model, operation, service, status..."
            />
          </div>

          <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
            {runsError ? (
              <div style={{ padding: 24 }}>
                <Alert
                  type="error"
                  showIcon
                  message="The LLM Runs explorer could not load."
                  description={getErrorMessage(primaryError, 'The backend request failed for this time range.')}
                />
              </div>
            ) : (
              <ObservabilityDataBoard
                data={{ rows: runs as any[], isLoading, serverTotal: runs.length }}
                config={{
                  columns: AI_RUN_COLUMNS,
                  rowKey: (run: any, index: number) => run.spanId || index,
                  renderRow: (run: any, context: any) => (
                    <AiRunsTableRow
                      run={run as LLMRun}
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
                    { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
                    { num: 2, text: <>Remove active <strong>filters</strong> from the query bar</> },
                    { num: 3, text: <>Ensure your services are instrumented with <strong>OpenLLMetry</strong></> },
                  ],
                }}
              />
            )}
          </div>

          {!isLoading && !runsError && runs.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 18px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing {formatNumber(runs.length)} runs
              </span>
              <Select
                size="small"
                value={pageSize}
                onChange={(value: number) => setPageSize(value)}
                options={[25, 50, 100].map((v) => ({ label: `${v} / page`, value: v }))}
                style={{ width: 110 }}
              />
            </div>
          )}
        </div>
      }
    />
  );
}
