import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import LogRow from '../log/LogRow';
import type { LogColumn, LogRecord, LogsBoardRenderContext } from '../../types';

export interface VirtualizedLogsTableProps {
  logs: LogRecord[];
  isLoading: boolean;
  columns: LogColumn[];
  visibleCols: Record<string, boolean>;
  colWidths: Record<string, number>;
  onOpenDetail: (log: LogRecord) => void;
  followOutput?: boolean | 'smooth' | 'auto';
}

export default function VirtualizedLogsTable({
  logs,
  isLoading,
  columns,
  visibleCols,
  colWidths,
  onOpenDetail,
  followOutput = false,
}: VirtualizedLogsTableProps) {
  
  const renderRow = (index: number, log: LogRecord) => {
    return (
      <div style={{ padding: '2px 0' }}>
        <LogRow
          log={log}
          columns={columns}
          visibleCols={visibleCols}
          colWidths={colWidths}
          onOpenDetail={onOpenDetail}
        />
      </div>
    );
  };

  if (isLoading && logs.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ marginBottom: 16 }} />
        Loading logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        No logs found matching your criteria.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, height: '100%', minHeight: 400, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'var(--literal-rgba-255-255-255-0p02)', padding: '8px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {columns.filter(c => visibleCols[c.key]).map(c => (
          <div key={c.key} style={{ 
            width: c.flex ? undefined : colWidths[c.key], 
            flex: c.flex ? `1 0 ${colWidths[c.key]}px` : undefined,
            padding: '0 12px' 
          }}>
            {c.label}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <Virtuoso
        style={{ height: 'calc(100% - 33px)' }}
        data={logs}
        itemContent={renderRow}
        followOutput={followOutput}
        initialTopMostItemIndex={0}
      />
    </div>
  );
}
