import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { QUERY_LABELS, createDefaultQuery } from "@shared/metrics/constants";
import type {
  ChartType,
  FormulaDefinition,
  MetricAggregation,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  MetricTagFilter,
  TimeStep,
} from "@shared/metrics/types";
import { deserializeStateSnapshot, serializeStateSnapshot } from "@shared/search/utils/urlState";

/** Mirrors the /metrics route's validated search params (same param names). */
type MetricsExplorerSearch = {
  queries?: string;
  formulas?: string;
  chartType?: string;
  step?: string;
  spaceAgg?: string;
  from?: string | number;
  to?: string | number;
  tz?: string;
};

const DEFAULT_QUERIES: MetricQueryDefinition[] = [createDefaultQuery(QUERY_LABELS[0])];

function decodeQueries(raw: string | undefined): MetricQueryDefinition[] {
  if (!raw) return DEFAULT_QUERIES;
  const parsed = deserializeStateSnapshot<MetricQueryDefinition[]>(raw, DEFAULT_QUERIES);
  return parsed.length > 0 ? parsed : DEFAULT_QUERIES;
}

function encodeQueries(queries: MetricQueryDefinition[]): string {
  return serializeStateSnapshot(queries);
}

const DEFAULT_FORMULAS: FormulaDefinition[] = [];

function decodeFormulas(raw: string | undefined): FormulaDefinition[] {
  if (!raw) return DEFAULT_FORMULAS;
  return deserializeStateSnapshot<FormulaDefinition[]>(raw, DEFAULT_FORMULAS);
}

function encodeFormulas(formulas: FormulaDefinition[]): string | undefined {
  if (formulas.length === 0) return undefined;
  return serializeStateSnapshot(formulas);
}

let formulaCounter = 0;

export function useMetricsExplorer() {
  const search = useSearch({ from: "/_app/metrics" });
  const navigate = useNavigate();

  const patchSearch = useCallback(
    (patch: Partial<MetricsExplorerSearch>) => {
      navigate({
        to: "/metrics",
        search: (prev: MetricsExplorerSearch) => ({ ...prev, ...patch }),
        replace: true,
      });
    },
    [navigate]
  );

  const queries = useMemo(() => decodeQueries(search.queries), [search.queries]);
  const formulas = useMemo(() => decodeFormulas(search.formulas), [search.formulas]);
  const chartType = (search.chartType as ChartType) || "line";
  const step = (search.step as TimeStep) || "5m";
  const spaceAgg = (search.spaceAgg as MetricSpaceAggregation) || "avg";

  const setQueries = useCallback(
    (next: MetricQueryDefinition[]) => {
      patchSearch({ queries: encodeQueries(next) });
    },
    [patchSearch]
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
    (ct: ChartType) => patchSearch({ chartType: ct }),
    [patchSearch]
  );

  const setStep = useCallback((s: TimeStep) => patchSearch({ step: s }), [patchSearch]);

  const setSpaceAgg = useCallback(
    (sa: MetricSpaceAggregation) => patchSearch({ spaceAgg: sa }),
    [patchSearch]
  );

  const setFormulas = useCallback(
    (next: FormulaDefinition[]) => {
      patchSearch({ formulas: encodeFormulas(next) });
    },
    [patchSearch]
  );

  const addFormula = useCallback(() => {
    formulaCounter++;
    setFormulas([...formulas, { id: `f${formulaCounter}`, expression: "" }]);
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
