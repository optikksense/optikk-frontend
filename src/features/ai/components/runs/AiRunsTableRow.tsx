import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { formatDuration, formatTimestamp, formatNumber } from '@shared/utils/formatters';
import { APP_COLORS } from '@config/colorLiterals';
import { cn } from '@/lib/utils';

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
            className="inline-flex items-center gap-1 font-semibold text-[12px] text-[var(--text-link)] cursor-pointer hover:underline"
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
          <span className="inline-block py-0.5 px-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs capitalize text-[var(--text-secondary)]">
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
          run.durationMs > 5000
            ? APP_COLORS.hex_f04438
            : run.durationMs > 2000
              ? APP_COLORS.hex_f79009
              : APP_COLORS.hex_73c991;
        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>
              {formatDuration(run.durationMs)}
            </span>
            <div className="traces-duration-bar-wrapper">
              <div
                className="traces-duration-bar"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      }
      case 'totalTokens':
        return (
          <span className="font-mono" style={{ fontSize: 12 }}>
            {formatNumber(run.totalTokens)}
            <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 4 }}>
              ({formatNumber(run.inputTokens)}+{formatNumber(run.outputTokens)})
            </span>
          </span>
        );
      case 'hasError':
        return (
          <span
            className={cn(
              'inline-flex py-0.5 px-2 rounded text-[11px] font-semibold',
              run.hasError
                ? 'bg-[rgba(240,68,56,0.12)] text-[#f04438]'
                : 'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
            )}
          >
            {run.hasError ? 'Error' : 'OK'}
          </span>
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
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{run.provider}</span>
            )}
          </div>
        );
      default: {
        const fallbackValue = run[columnKey as keyof LLMRun];
        return <span>{String(fallbackValue ?? '—')}</span>;
      }
    }
  };

  return (
    <>
      {fixedColumns.map((col) => (
        <div
          key={col.key}
          className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis shrink-0 border-r border-[color:var(--glass-border)] px-[10px] py-[6px] box-border min-h-[34px]"
          style={{ width: colWidths[col.key] }}
          onClick={() => onOpenDetail(run)}
        >
          {renderCell(col.key)}
        </div>
      ))}
      {flexColumn && (
        <div
          className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 border-r-0 border-[color:var(--glass-border)] px-[10px] py-[6px] box-border min-h-[34px]"
          onClick={() => onOpenDetail(run)}
        >
          {renderCell(flexColumn.key)}
        </div>
      )}
    </>
  );
});

export default AiRunsTableRow;
