import type { LogColumn, LogFilterField } from '../types';

/**
 *
 */
export function toDisplayText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

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

/**
 * Filter fields used by the shared ObservabilityQueryBar on logs page.
 */
export const LOG_FILTER_FIELDS: LogFilterField[] = [
  {
    key: 'service_name', label: 'Service', icon: '⚙️', group: 'Service',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'level', label: 'Level', icon: '🎚️', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'host', label: 'Host', icon: '🖥️', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'pod', label: 'Pod', icon: '📦', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'container', label: 'Container', icon: '🐳', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'logger', label: 'Logger', icon: '📝', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'trace_id', label: 'Trace ID', icon: '🔗', group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'span_id', label: 'Span ID', icon: '🔀', group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
];

/**
 *
 */
export const LOG_COLUMNS: LogColumn[] = [
  { key: 'timestamp', label: 'Time', defaultWidth: 175, defaultVisible: true },
  { key: 'level', label: 'Level', defaultWidth: 80, defaultVisible: true },
  { key: 'service_name', label: 'Service', defaultWidth: 160, defaultVisible: true },
  { key: 'host', label: 'Host/Pod', defaultWidth: 140, defaultVisible: false },
  { key: 'logger', label: 'Logger', defaultWidth: 160, defaultVisible: false },
  { key: 'trace_id', label: 'Trace ID', defaultWidth: 220, defaultVisible: false },
  { key: 'thread', label: 'Thread', defaultWidth: 120, defaultVisible: false },
  { key: 'container', label: 'Container', defaultWidth: 140, defaultVisible: false },
  { key: 'message', label: 'Message', defaultWidth: 720, defaultVisible: true, flex: true },
];

/**
 *
 */
export const LOGS_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
};
