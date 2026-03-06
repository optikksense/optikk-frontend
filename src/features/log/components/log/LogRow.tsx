import { getLogValue } from '@utils/logUtils';
import { tsLabel } from '@utils/time';

/* ─── Level badge ─────────────────────────────────────────────────────────── */

const LEVEL_STYLES = {
  FATAL: { bg: '#D92D20', color: '#fff' },
  ERROR: { bg: '#F04438', color: '#fff' },
  WARN: { bg: '#F79009', color: '#fff' },
  WARNING: { bg: '#F79009', color: '#fff' },
  INFO: { bg: '#06AED5', color: '#fff' },
  DEBUG: { bg: '#5E60CE', color: '#fff' },
  TRACE: { bg: '#98A2B3', color: '#fff' },
};

/**
 *
 * @param root0
 * @param root0.level
 */
export function LevelBadge({ level }) {
  const l = (level || 'INFO').toUpperCase();
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

/**
 *
 * @param root0
 * @param root0.log
 * @param root0.colWidths
 * @param root0.visibleCols
 * @param root0.columns
 * @param root0.onOpenDetail
 */
export default function LogRow({ log, colWidths, visibleCols, columns, onOpenDetail }) {
  const fixedCols = columns.filter((c) => !c.flex && visibleCols[c.key]);
  const flexCol = columns.find((c) => c.flex && visibleCols[c.key]);

  const renderCell = (colKey) => {
    switch (colKey) {
      case 'timestamp':
        return <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{tsLabel(log.timestamp)}</span>;
      case 'level':
        return <LevelBadge level={getLogValue(log, 'level')} />;
      case 'service_name':
        return (
          <span style={{ fontSize: 12 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#5E60CE', marginRight: 5, verticalAlign: 'middle' }} />
            {getLogValue(log, 'service_name') || '—'}
          </span>
        );
      case 'host':
        return <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{log.host || log.pod || '—'}</span>;
      case 'logger':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{log.logger || '—'}</span>;
      case 'trace_id':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{log.traceId || log.trace_id || '—'}</span>;
      case 'thread':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.thread || '—'}</span>;
      case 'container':
        return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.container || '—'}</span>;
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
            title={log.message}
          >
            {log.message || '—'}
          </span>
        );
      default:
        return <span style={{ fontSize: 12 }}>{log[colKey] ?? '—'}</span>;
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
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
              flex: '1 0 100ch',
              minWidth: '100ch',
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
