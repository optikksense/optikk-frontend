import { useQuery } from '@tanstack/react-query';
import { logsService } from '@shared/api/logsService';
import { tsLabel } from '@shared/utils/time';
import { useAppStore } from '@shared/store/appStore';
import { LevelBadge } from './LogRow';
import type { LogRecord } from '../../types';

interface SurroundingResponse {
  anchor: LogRecord;
  before: LogRecord[];
  after: LogRecord[];
}

interface LogSurroundingPanelProps {
  log: LogRecord;
}

function SurroundingRow({ log, isAnchor }: { log: LogRecord; isAnchor?: boolean }) {
  const level = (log.level ?? log.severity_text ?? log.severityText) as string | undefined;
  const message = (log.body ?? log.message) as string | undefined;

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        padding: '4px 8px',
        borderRadius: 6,
        background: isAnchor ? 'rgba(94,96,206,0.15)' : 'transparent',
        border: isAnchor ? '1px solid rgba(94,96,206,0.4)' : '1px solid transparent',
        opacity: isAnchor ? 1 : 0.6,
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: 130 }}>
        {tsLabel(log.timestamp)}
      </span>
      <LevelBadge level={level} />
      <span style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-word', flex: 1, color: 'var(--text-primary)' }}>
        {message ?? '—'}
      </span>
    </div>
  );
}

export default function LogSurroundingPanel({ log }: LogSurroundingPanelProps) {
  const { selectedTeamId } = useAppStore();
  const logId = log.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['logs', 'surrounding', logId],
    queryFn: async () => {
      const response = await logsService.getLogSurrounding(selectedTeamId, logId, 10, 10);
      return response as SurroundingResponse;
    },
    enabled: !!logId,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center' }}>
        Loading context…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center' }}>
        Could not load surrounding context.
      </div>
    );
  }

  const before = data.before ?? [];
  const after = data.after ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0' }}>
      {before.map((l, i) => (
        <SurroundingRow key={l.id ?? `before-${i}`} log={l} />
      ))}
      <SurroundingRow log={data.anchor} isAnchor />
      {after.map((l, i) => (
        <SurroundingRow key={l.id ?? `after-${i}`} log={l} />
      ))}
    </div>
  );
}
