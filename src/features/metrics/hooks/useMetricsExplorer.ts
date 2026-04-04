import { useCallback, useMemo } from 'react';

import { useURLFilters, type URLFilterConfig } from '@/shared/hooks/useURLFilters';
import {
  serializeStateSnapshot,
  deserializeStateSnapshot,
} from '@/features/explorer-core/utils/urlState';
import { createDefaultQuery, QUERY_LABELS } from '../constants';
import type {
  ChartType,
  FormulaDefinition,
  MetricAggregation,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  MetricTagFilter,
  TimeStep,
} from '../types';

const URL_CONFIG: URLFilterConfig = {
  params: [
    { key: 'queries', type: 'string', defaultValue: '' },
    { key: 'formulas', type: 'string', defaultValue: '' },
    { key: 'chartType', type: 'string', defaultValue: 'line' },
    { key: 'step', type: 'string', defaultValue: '5m' },
    { key: 'spaceAgg', type: 'string', defaultValue: 'avg' },
  ],
};

const DEFAULT_QUERIES: MetricQueryDefinition[] = [createDefaultQuery(QUERY_LABELS[0])];

function decodeQueries(raw: string): MetricQueryDefinition[] {
  if (!raw) return DEFAULT_QUERIES;
  const parsed = deserializeStateSnapshot<MetricQueryDefinition[]>(raw, DEFAULT_QUERIES);
  return parsed.length > 0 ? parsed : DEFAULT_QUERIES;
}

function encodeQueries(queries: MetricQueryDefinition[]): string {
  return serializeStateSnapshot(queries);
}

const DEFAULT_FORMULAS: FormulaDefinition[] = [];

function decodeFormulas(raw: string): FormulaDefinition[] {
  if (!raw) return DEFAULT_FORMULAS;
  return deserializeStateSnapshot<FormulaDefinition[]>(raw, DEFAULT_FORMULAS);
}

function encodeFormulas(formulas: FormulaDefinition[]): string {
  if (formulas.length === 0) return '';
  return serializeStateSnapshot(formulas);
}

let formulaCounter = 0;

export function useMetricsExplorer() {
  const { values, setters } = useURLFilters(URL_CONFIG);

  const queries = useMemo(
    () => decodeQueries(values.queries as string),
    [values.queries]
  );
  const formulas = useMemo(
    () => decodeFormulas(values.formulas as string),
    [values.formulas]
  );
  const chartType = (values.chartType as ChartType) || 'line';
  const step = (values.step as TimeStep) || '5m';
  const spaceAgg = (values.spaceAgg as MetricSpaceAggregation) || 'avg';

  const setQueries = useCallback(
    (next: MetricQueryDefinition[]) => {
      setters.queries(encodeQueries(next));
    },
    [setters]
  );

  const addQuery = useCallback(() => {
    const usedLabels = new Set(queries.map((q) => q.id));
    const nextLabel = QUERY_LABELS.find((l) => !usedLabels.has(l));
    if (!nextLabel) return;
    setQueries([...queries, createDefaultQuery(nextLabel)]);
  }, [queries, setQueries]);

  const removeQuery = useCallback(
    (id: string) => {
      if (queries.length <= 1) return;
      setQueries(queries.filter((q) => q.id !== id));
    },
    [queries, setQueries]
  );

  const updateQuery = useCallback(
    (id: string, patch: Partial<MetricQueryDefinition>) => {
      setQueries(queries.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    },
    [queries, setQueries]
  );

  const updateQueryAggregation = useCallback(
    (id: string, aggregation: MetricAggregation) => updateQuery(id, { aggregation }),
    [updateQuery]
  );

  const updateQueryMetric = useCallback(
    (id: string, metricName: string) => updateQuery(id, { metricName, where: [], groupBy: [] }),
    [updateQuery]
  );

  const updateQueryWhere = useCallback(
    (id: string, where: MetricTagFilter[]) => updateQuery(id, { where }),
    [updateQuery]
  );

  const updateQueryGroupBy = useCallback(
    (id: string, groupBy: string[]) => updateQuery(id, { groupBy }),
    [updateQuery]
  );

  const setChartType = useCallback(
    (ct: ChartType) => setters.chartType(ct),
    [setters]
  );

  const setStep = useCallback(
    (s: TimeStep) => setters.step(s),
    [setters]
  );

  const setSpaceAgg = useCallback(
    (sa: MetricSpaceAggregation) => setters.spaceAgg(sa),
    [setters]
  );

  const setFormulas = useCallback(
    (next: FormulaDefinition[]) => {
      setters.formulas(encodeFormulas(next));
    },
    [setters]
  );

  const addFormula = useCallback(() => {
    formulaCounter++;
    setFormulas([...formulas, { id: `f${formulaCounter}`, expression: '' }]);
  }, [formulas, setFormulas]);

  const removeFormula = useCallback(
    (id: string) => {
      setFormulas(formulas.filter((f) => f.id !== id));
    },
    [formulas, setFormulas]
  );

  const updateFormulaExpression = useCallback(
    (id: string, expression: string) => {
      setFormulas(formulas.map((f) => (f.id === id ? { ...f, expression } : f)));
    },
    [formulas, setFormulas]
  );

  const canExecute = queries.some((q) => Boolean(q.metricName));

  return {
    queries,
    formulas,
    chartType,
    step,
    spaceAgg,
    canExecute,
    addQuery,
    removeQuery,
    updateQuery,
    updateQueryAggregation,
    updateQueryMetric,
    updateQueryWhere,
    updateQueryGroupBy,
    addFormula,
    removeFormula,
    updateFormulaExpression,
    setChartType,
    setStep,
    setSpaceAgg,
  };
}
