import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatDuration, formatTimestamp } from '@utils/formatters';

import type { TraceColumn, TraceRecord } from '../../types';
import TraceMethodBadge from './TraceMethodBadge';
import TraceStatusBadge from './TraceStatusBadge';

interface TracesTableRowProps {
  trace: TraceRecord;
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
  maxDuration: number;
  columns: TraceColumn[];
  onRowClick: (spanId: string) => void;
  onOpenDetail: (trace: TraceRecord) => void;
}

/**
 * Row renderer for traces in ObservabilityDataBoard.
 */
export default function TracesTableRow({
  trace,
  colWidths,
  visibleCols,
  maxDuration,
  columns,
  onRowClick,
  onOpenDetail,
}: TracesTableRowProps): JSX.Element {
  const fixedColumns = columns.filter((column) => !column.flex && visibleCols[column.key]);
  const flexColumn = columns.find((column) => column.flex && visibleCols[column.key]);

  const renderCell = (columnKey: string): ReactNode => {
    switch (columnKey) {
      case 'trace_id':
        return (
          <span
            className="traces-trace-id"
            onClick={(event) => {
              event.stopPropagation();
              onRowClick(trace.span_id || trace.trace_id);
            }}
            title={trace.trace_id}
          >
            <ArrowUpRight size={11} />
            {trace.trace_id ? `${trace.trace_id.slice(0, 16)}…` : '—'}
          </span>
        );
      case 'service_name':
        return (
          <span className="traces-service-tag">
            <span className="traces-service-tag-dot" />
            {trace.service_name || '—'}
          </span>
        );
      case 'status':
        return <TraceStatusBadge status={trace.status} />;
      case 'duration_ms': {
        const percentage =
          maxDuration > 0 ? Math.min((trace.duration_ms / maxDuration) * 100, 100) : 0;
        const color =
          trace.duration_ms > 1000 ? '#F04438' : trace.duration_ms > 500 ? '#F79009' : '#73C991';

        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>
              {formatDuration(trace.duration_ms)}
            </span>
            <div className="traces-duration-bar-wrapper">
              <div
                className="traces-duration-bar"
                style={{ width: `${percentage}%`, background: color }}
              />
            </div>
          </div>
        );
      }
      case 'http_status_code': {
        if (!trace.http_status_code) {
          return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        }

        const color =
          trace.http_status_code >= 500
            ? '#F04438'
            : trace.http_status_code >= 400
              ? '#F79009'
              : '#73C991';

        return (
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color }}>
            {trace.http_status_code}
          </span>
        );
      }
      case 'start_time':
        return <span className="traces-timestamp">{formatTimestamp(trace.start_time)}</span>;
      case 'operation_name':
        return (
          <div className="traces-operation-cell">
            <span className="traces-operation-name" title={trace.operation_name}>
              {trace.operation_name || '—'}
            </span>
            {(trace.http_method || trace.http_status_code > 0) && (
              <div className="traces-http-meta">
                <TraceMethodBadge method={trace.http_method} />
                {trace.http_status_code > 0 && (
                  <span className="traces-http-code">HTTP {trace.http_status_code}</span>
                )}
              </div>
            )}
          </div>
        );
      default:
        return <span>{String(trace[columnKey] ?? '—')}</span>;
    }
  };

  return (
    <>
      {fixedColumns.map((column) => (
        <div
          key={column.key}
          className="oboard__td"
          style={{ width: colWidths[column.key] }}
          onClick={() => onOpenDetail(trace)}
        >
          {renderCell(column.key)}
        </div>
      ))}
      {flexColumn && (
        <div className="oboard__td oboard__td--flex" onClick={() => onOpenDetail(trace)}>
          {renderCell(flexColumn.key)}
        </div>
      )}
    </>
  );
}

