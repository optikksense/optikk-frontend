import { useCallback, useState } from "react";

import { QUERY_LABELS, createDefaultQuery } from "@/features/metrics/constants";
import type {
  MetricAggregation,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  MetricTagFilter,
  TimeStep,
} from "@/features/metrics/types";

import {
  type WidgetDisplayOptions,
  type WidgetEditorState,
  type WidgetSize,
  type WidgetVizType,
  createDefaultEditorState,
} from "../../builder/metricsWidget";

let formulaCounter = 0;

/**
 * Local editor state for the widget editor: mirrors useMetricsExplorer's query
 * handlers but holds state in useState (no URL coupling) and adds the widget
 * dimensions (viz, step, display, size, title). Seed via specToEditorState.
 */
export function useWidgetEditorState(initial?: WidgetEditorState) {
  const [state, setState] = useState<WidgetEditorState>(
    () => initial ?? createDefaultEditorState()
  );

  const addQuery = useCallback(() => {
    setState((prev) => {
      const used = new Set(prev.queries.map((q) => q.id));
      const nextLabel = QUERY_LABELS.find((l) => !used.has(l));
      if (!nextLabel) return prev;
      return { ...prev, queries: [...prev.queries, createDefaultQuery(nextLabel)] };
    });
  }, []);

  const removeQuery = useCallback((id: string) => {
    setState((prev) =>
      prev.queries.length <= 1
        ? prev
        : { ...prev, queries: prev.queries.filter((q) => q.id !== id) }
    );
  }, []);

  const updateQuery = useCallback((id: string, patch: Partial<MetricQueryDefinition>) => {
    setState((prev) => ({
      ...prev,
      queries: prev.queries.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
  }, []);

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

  const addFormula = useCallback(() => {
    formulaCounter++;
    setState((prev) => ({
      ...prev,
      formulas: [...prev.formulas, { id: `f${formulaCounter}`, expression: "" }],
    }));
  }, []);

  const removeFormula = useCallback((id: string) => {
    setState((prev) => ({ ...prev, formulas: prev.formulas.filter((f) => f.id !== id) }));
  }, []);

  const updateFormulaExpression = useCallback((id: string, expression: string) => {
    setState((prev) => ({
      ...prev,
      formulas: prev.formulas.map((f) => (f.id === id ? { ...f, expression } : f)),
    }));
  }, []);

  const setTitle = useCallback((title: string) => setState((p) => ({ ...p, title })), []);
  const setViz = useCallback((viz: WidgetVizType) => setState((p) => ({ ...p, viz })), []);
  const setStep = useCallback((step: TimeStep) => setState((p) => ({ ...p, step })), []);
  const setSpaceAgg = useCallback(
    (spaceAgg: MetricSpaceAggregation) => setState((p) => ({ ...p, spaceAgg })),
    []
  );
  const setSize = useCallback((size: WidgetSize) => setState((p) => ({ ...p, size })), []);
  const setDisplay = useCallback(
    (patch: Partial<WidgetDisplayOptions>) =>
      setState((p) => ({ ...p, display: { ...p.display, ...patch } })),
    []
  );

  const canExecute = state.queries.some((q) => Boolean(q.metricName));

  return {
    state,
    canExecute,
    addQuery,
    removeQuery,
    updateQueryAggregation,
    updateQueryMetric,
    updateQueryWhere,
    updateQueryGroupBy,
    addFormula,
    removeFormula,
    updateFormulaExpression,
    setTitle,
    setViz,
    setStep,
    setSpaceAgg,
    setSize,
    setDisplay,
  };
}
