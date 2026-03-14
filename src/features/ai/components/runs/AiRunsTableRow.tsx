import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { formatDuration, formatTimestamp, formatNumber } from '@shared/utils/formatters';
import { APP_COLORS } from '@config/colorLiterals';

import type { LLMRun } from '../../types';
import type { AiRunColumn } from '../../utils/aiRunsUtils';
import type { ReactNode } from 'react';

interface AiRunsTableRowProps {
  run: LLMRun;
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
  maxDuration: number;
  columns: AiRunColumn[];
  onRowClick: (spanId: string) => void;
  onOpenDetail: (run: LLMRun) => void;
}

export const AiRunsTableRow = React.memo(function AiRunsTableRow({
  run,
  colWidths,
  visibleCols,
  maxDuration,
  columns,
  onRowClick,
  onOpenDetail,
}: AiRunsTableRowProps): JSX.Element {
  const fixedColumns = columns.filter((col) => !col.flex && visibleCols[col.key]);
  const flexColumn = columns.find((col) => col.flex && visibleCols[col.key]);

  const renderCell = (columnKey: string): ReactNode => {
    switch (columnKey) {
      case 'model':
        return (
          <span
            className="ai-runs-model-name"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(run.spanId);
            }}
          >
            <ArrowUpRight size={11} />
            {run.model || '—'}
          </span>
        );
      case 'operationType':
        return (
          <span className="ai-runs-operation-badge">
            {run.operationType || '—'}
          </span>
        );
      case 'serviceName':
        return (
          <span className="traces-service-tag">
            <span className="traces-service-tag-dot" />
            {run.serviceName || '—'}
          </span>
        );
      case 'durationMs': {
        const pct = maxDuration > 0 ? Math.min((run.durationMs / maxDuration) * 100, 100) : 0;
        const color =
          run.durationMs > 5000 ? APP_COLORS.hex_f04438 : run.durationMs > 2000 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991;
        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>
              {formatDuration(run.durationMs)}
            </span>
            <div className="traces-duration-bar-wrapper">
              <div className="traces-duration-bar" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      }
      case 'totalTokens':
        return (
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {formatNumber(run.totalTokens)}
            <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 4 }}>
              ({formatNumber(run.inputTokens)}+{formatNumber(run.outputTokens)})
            </span>
          </span>
        );
      case 'hasError':
        return run.hasError ? (
          <span className="ai-runs-status-badge error">Error</span>
        ) : (
          <span className="ai-runs-status-badge ok">OK</span>
        );
      case 'startTime':
        return <span className="traces-timestamp">{formatTimestamp(run.startTime)}</span>;
      case 'operationName':
        return (
          <div className="traces-operation-cell">
            <span className="traces-operation-name" title={run.operationName}>
              {run.operationName || '—'}
            </span>
            {run.provider && (
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                {run.provider}
              </span>
            )}
          </div>
        );
      default:
        return <span>{String((run as any)[columnKey] ?? '—')}</span>;
    }
  };

  return (
    <>
      {fixedColumns.map((col) => (
        <div
          key={col.key}
          className="oboard__td"
          style={{ width: colWidths[col.key] }}
          onClick={() => onOpenDetail(run)}
        >
          {renderCell(col.key)}
        </div>
      ))}
      {flexColumn && (
        <div className="oboard__td oboard__td--flex" onClick={() => onOpenDetail(run)}>
          {renderCell(flexColumn.key)}
        </div>
      )}
    </>
  );
});

export default AiRunsTableRow;
