import type {
  ChartType,
  MetricAggregation,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  TimeStep,
} from '../types';

export const DOMAIN_KEY = 'metrics';

export const QUERY_LABELS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export const QUERY_LABEL_COLORS: Record<string, string> = {
  a: '#3b82f6',
  b: '#22c55e',
  c: '#f97316',
  d: '#a855f7',
  e: '#ec4899',
  f: '#14b8a6',
};

export const AGGREGATION_OPTIONS: { label: string; value: MetricAggregation }[] = [
  { label: 'avg', value: 'avg' },
  { label: 'sum', value: 'sum' },
  { label: 'min', value: 'min' },
  { label: 'max', value: 'max' },
  { label: 'count', value: 'count' },
  { label: 'p50', value: 'p50' },
  { label: 'p95', value: 'p95' },
  { label: 'p99', value: 'p99' },
  { label: 'rate', value: 'rate' },
];

export const TIME_STEP_OPTIONS: { label: string; value: TimeStep }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '1d', value: '1d' },
];

export const CHART_TYPE_OPTIONS: { label: string; value: ChartType }[] = [
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
  { label: 'Bar', value: 'bar' },
];

export const SPACE_AGGREGATION_OPTIONS: { label: string; value: MetricSpaceAggregation }[] = [
  { label: 'avg', value: 'avg' },
  { label: 'sum', value: 'sum' },
  { label: 'min', value: 'min' },
  { label: 'max', value: 'max' },
];

export const MAX_QUERIES = 6;

export function createDefaultQuery(label: string): MetricQueryDefinition {
  return {
    id: label,
    aggregation: 'avg',
    metricName: '',
    where: [],
    groupBy: [],
    spaceAggregation: 'avg',
  };
}
