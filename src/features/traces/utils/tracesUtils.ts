import type { TraceRecord, TraceSummary } from '../types';
import { asRecord, toNumber, toStringValue } from '@shared/utils/coerce';
export { asRecord, toNumber, toStringValue };

interface TraceFilterOperator {
  key: string;
  label: string;
  symbol: string;
}

interface TraceFilterField {
  key: string;
  label: string;
  icon: string;
  group: string;
  operators: TraceFilterOperator[];
}

/**
 *
 */
export interface TracesResponse {
  traces: unknown[];
  total: number;
  summary: TraceSummary;
}

/**
 *
 */
export function normalizeTracesResponse(value: unknown): TracesResponse {
  const row = asRecord(value);
  const traces = Array.isArray(row.traces) ? row.traces.map((trace) => normalizeTrace(trace)) : [];
  const summaryRecord = asRecord(row.summary);
  const summary: TraceSummary = {
    total_traces: toNumber(summaryRecord.total_traces),
    error_traces: toNumber(summaryRecord.error_traces),
    avg_duration: toNumber(summaryRecord.avg_duration),
    p50_duration: toNumber(summaryRecord.p50_duration),
    p95_duration: toNumber(summaryRecord.p95_duration),
    p99_duration: toNumber(summaryRecord.p99_duration),
  };
  const total = toNumber(row.total ?? summary.total_traces);
  return { traces, total, summary };
}

/**
 *
 */
export function normalizeTrace(input: unknown): TraceRecord {
  const row = asRecord(input);
  return {
    ...row,
    span_id: toStringValue(row.span_id),
    trace_id: toStringValue(row.trace_id),
    service_name: toStringValue(row.service_name),
    operation_name: toStringValue(row.operation_name),
    start_time: toStringValue(row.start_time),
    end_time: toStringValue(row.end_time),
    duration_ms: toNumber(row.duration_ms),
    status: toStringValue(row.status) || 'UNSET',
    span_kind: toStringValue(row.span_kind),
    http_method: toStringValue(row.http_method),
    http_status_code: toNumber(row.http_status_code),
  };
}

/**
 * Filter fields used by the shared ObservabilityQueryBar on traces page.
 */
export const TRACE_FILTER_FIELDS: TraceFilterField[] = [
  {
    key: 'trace_id',
    label: 'Trace ID',
    icon: '🔗',
    group: 'Trace',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'operation_name',
    label: 'Operation',
    icon: '⚡',
    group: 'Trace',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    icon: '🔵',
    group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'service_name',
    label: 'Service',
    icon: '⚙️',
    group: 'Service',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'http_method',
    label: 'HTTP Method',
    icon: '🌐',
    group: 'HTTP',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'http_status',
    label: 'HTTP Status Code',
    icon: '📡',
    group: 'HTTP',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
  {
    key: 'duration_ms',
    label: 'Duration (ms)',
    icon: '⏱',
    group: 'Performance',
    operators: [
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
  {
    key: 'span_kind',
    label: 'Span kind',
    icon: '🧩',
    group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'db_system',
    label: 'DB system',
    icon: '🗄',
    group: 'Database',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
];
