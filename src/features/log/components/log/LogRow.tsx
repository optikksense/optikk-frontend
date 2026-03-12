import { getLogValue } from '@shared/utils/logUtils';
import { tsLabel } from '@shared/utils/time';

import { APP_COLORS } from '@config/colorLiterals';

import type { LogColumn, LogRecord } from '../../types';
import type { ReactNode } from 'react';

/* ─── Level badge ─────────────────────────────────────────────────────────── */

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  FATAL: { bg: '#6F1B1B', color: APP_COLORS.hex_fff },
  ERROR: { bg: '#FF5C5C', color: APP_COLORS.hex_fff },
  WARN: { bg: '#FFB300', color: '#1a1a1a' },
  WARNING: { bg: '#FFB300', color: '#1a1a1a' },
  INFO: { bg: '#2871E6', color: APP_COLORS.hex_fff },
  DEBUG: { bg: '#6C737A', color: APP_COLORS.hex_fff },
  TRACE: { bg: '#B0B8C4', color: '#1a1a1a' },
};

function toDisplayText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (_error: unknown) {
    return String(value);
  }
}

interface LevelBadgeProps {
  level?: unknown;
}

/**
 *
 * @param root0
 * @param root0.level
 */
export function LevelBadge({ level }: LevelBadgeProps) {
  const levelLabel = typeof level === 'string' ? level : String(level ?? 'INFO');
  const l = levelLabel.toUpperCase();
  const style = LEVEL_STYLES[l] || LEVEL_STYLES.INFO;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 7px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'monospace',
        letterSpacing: '0.04em',
        background: style.bg,
        color: style.color,
        minWidth: 46,
        textAlign: 'center',
      }}
    >
      {l}
    </span>
  );
}

/* ─── Log row for the ObservabilityDataBoard ──────────────────────────────── */

interface LogRowProps {
  log: LogRecord;
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
  columns: LogColumn[];
  onOpenDetail: (log: LogRecord) => void;
}

/**
 *
 * @param root0
 * @param root0.log
 * @param root0.colWidths
 * @param root0.visibleCols
 * @param root0.columns
 * @param root0.onOpenDetail
 */
export default function LogRow({
  log,
  colWidths,
  visibleCols,
  columns,
  onOpenDetail,
}: LogRowProps) {
  const fixedCols = columns.filter((c) => !c.flex && visibleCols[c.key]);
  const flexCol = columns.find((c) => c.flex && visibleCols[c.key]);

  const renderCell = (colKey: string): ReactNode => {
    const messageValue = toDisplayText(log.message);

    switch (colKey) {
      case 'timestamp':
        return <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{tsLabel(log.timestamp)}</span>;
      case 'level':
        return <LevelBadge level={getLogValue(log, 'level')} />;
      case 'service_name':
        return (
          <span style={{ fontSize: 12 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: APP_COLORS.hex_5e60ce, marginRight: 5, verticalAlign: 'middle' }} />
            {toDisplayText(getLogValue(log, 'service_name'))}
          </span>
        );
      case 'host':
        return <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{toDisplayText(log.host || log.pod)}</span>;
      case 'logger':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{toDisplayText(log.logger)}</span>;
      case 'trace_id':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{toDisplayText(log.traceId || log.trace_id)}</span>;
      case 'thread':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{toDisplayText(log.thread)}</span>;
      case 'container':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{toDisplayText(log.container)}</span>;
      case 'message':
        return (
          <span
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              lineHeight: 1.4,
              color: 'var(--text-primary)',
            }}
            title={messageValue}
          >
            {messageValue}
          </span>
        );
      default:
        return <span style={{ fontSize: 12 }}>{toDisplayText(log[colKey])}</span>;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        width: '100%',
        marginBottom: '4px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        transition: 'var(--transition-smooth)',
        cursor: 'pointer',
      }}
      onClick={() => onOpenDetail(log)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = APP_COLORS.rgba_255_255_255_0p05;
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--glass-bg)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
      }}
    >
      {fixedCols.map((col) => (
        <div
          key={col.key}
          className="oboard__td"
          style={{ width: colWidths[col.key], borderBottom: 'none' }}
        >
          {renderCell(col.key)}
        </div>
      ))}
      {flexCol && (
        <div
          className="oboard__td oboard__td--flex"
          style={{
            ...((flexCol.key === 'message') ? {
              alignItems: 'flex-start',
              whiteSpace: 'normal',
              flex: `1 0 ${colWidths[flexCol.key] ?? 720}px`,
              minWidth: colWidths[flexCol.key] ?? 720,
            } : {}),
            borderBottom: 'none',
          }}
        >
          {renderCell(flexCol.key)}
        </div>
      )}
    </div>
  );
}
