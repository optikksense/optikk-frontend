import type { LogAttributeFilter, LogFilterField, LogsBackendParams } from '../types';
import type { StructuredFilter } from '@shared/hooks/useURLFilters';

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
    key: 'service_name',
    label: 'Service',
    icon: '⚙️',
    group: 'Service',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'not_equals', label: 'not equals', symbol: '!=' },
    ],
  },
  {
    key: 'level',
    label: 'Level',
    icon: '🎚️',
    group: 'Log',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'not_equals', label: 'not equals', symbol: '!=' },
    ],
  },
  {
    key: 'host',
    label: 'Host',
    icon: '🖥️',
    group: 'Infrastructure',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'not_equals', label: 'not equals', symbol: '!=' },
    ],
  },
  {
    key: 'pod',
    label: 'Pod',
    icon: '📦',
    group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'container',
    label: 'Container',
    icon: '🐳',
    group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'environment',
    label: 'Environment',
    icon: '🌍',
    group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'logger',
    label: 'Logger',
    icon: '📝',
    group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'trace_id',
    label: 'Trace ID',
    icon: '🔗',
    group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'span_id',
    label: 'Span ID',
    icon: '🔀',
    group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
];

export const LOGS_URL_FILTER_CONFIG = {
  params: [
    { key: 'query', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
  stripParams: ['view', 'search'],
};

export function compileLogsStructuredFilters(
  filters: StructuredFilter[]
): Partial<LogsBackendParams> {
  const compiled: Partial<LogsBackendParams> = {};
  const attributeFilters: LogAttributeFilter[] = [];

  const append = (
    key:
      | 'services'
      | 'excludeServices'
      | 'severities'
      | 'excludeSeverities'
      | 'hosts'
      | 'excludeHosts'
      | 'pods'
      | 'containers'
      | 'environments'
      | 'loggers',
    value: string
  ): void => {
    const current = compiled[key] ?? [];
    compiled[key] = [...current, value];
  };

  for (const filter of filters) {
    switch (filter.field) {
      case 'service_name':
        append(filter.operator === 'not_equals' ? 'excludeServices' : 'services', filter.value);
        break;
      case 'level':
        append(filter.operator === 'not_equals' ? 'excludeSeverities' : 'severities', filter.value);
        break;
      case 'host':
        append(filter.operator === 'not_equals' ? 'excludeHosts' : 'hosts', filter.value);
        break;
      case 'pod':
        append('pods', filter.value);
        break;
      case 'container':
        append('containers', filter.value);
        break;
      case 'environment':
        append('environments', filter.value);
        break;
      case 'logger':
        append('loggers', filter.value);
        break;
      case 'trace_id':
        compiled.traceId = filter.value;
        break;
      case 'span_id':
        compiled.spanId = filter.value;
        break;
      default:
        attributeFilters.push({
          key: filter.field,
          value: filter.value,
          op: filter.operator === 'not_equals' ? 'neq' : 'eq',
        });
    }
  }

  if (attributeFilters.length > 0) {
    compiled.attributeFilters = attributeFilters;
  }

  return compiled;
}

export function upsertLogFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) {
    return withoutField;
  }

  return [
    ...withoutField,
    {
      field: nextField,
      operator: 'equals',
      value: nextValue,
    },
  ];
}
