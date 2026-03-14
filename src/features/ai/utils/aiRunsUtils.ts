interface AiRunFilterOperator {
  key: string;
  label: string;
  symbol: string;
}

interface AiRunFilterField {
  key: string;
  label: string;
  icon: string;
  group: string;
  operators: AiRunFilterOperator[];
}

export const AI_RUN_FILTER_FIELDS: AiRunFilterField[] = [
  {
    key: 'model',
    label: 'Model',
    icon: '🤖',
    group: 'LLM',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'operation_type',
    label: 'Operation',
    icon: '⚡',
    group: 'LLM',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'provider',
    label: 'Provider',
    icon: '🏢',
    group: 'LLM',
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
    key: 'status',
    label: 'Status',
    icon: '🔵',
    group: 'LLM',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
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
    key: 'total_tokens',
    label: 'Total Tokens',
    icon: '🔢',
    group: 'Performance',
    operators: [
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
];

export interface AiRunColumn {
  key: string;
  label: string;
  defaultWidth?: number;
  defaultVisible: boolean;
  flex?: boolean;
}

export const AI_RUN_COLUMNS: AiRunColumn[] = [
  { key: 'model', label: 'Model', defaultWidth: 180, defaultVisible: true },
  { key: 'operationType', label: 'Operation', defaultWidth: 120, defaultVisible: true },
  { key: 'serviceName', label: 'Service', defaultWidth: 140, defaultVisible: true },
  { key: 'durationMs', label: 'Latency', defaultWidth: 100, defaultVisible: true },
  { key: 'totalTokens', label: 'Tokens', defaultWidth: 100, defaultVisible: true },
  { key: 'hasError', label: 'Status', defaultWidth: 85, defaultVisible: true },
  { key: 'startTime', label: 'Time', defaultWidth: 165, defaultVisible: true },
  { key: 'operationName', label: 'Span Name', defaultVisible: true, flex: true },
];
