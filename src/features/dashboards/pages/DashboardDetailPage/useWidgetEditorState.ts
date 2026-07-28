import { useState } from "react";

import { QUERY_LABELS, createDefaultQuery } from "@shared/metrics/constants";
import type {
  MetricAggregation,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  MetricTagFilter,
  TimeStep,
} from "@shared/metrics/types";

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

  const addQuery = () => {
    setState((prev) => {
      const used = new Set(prev.queries.map((q) => q.id));
      const nextLabel = QUERY_LABELS.find((l) => !used.has(l));
      if (!nextLabel) return prev;
      return { ...prev, queries: [...prev.queries, createDefaultQuery(nextLabel)] };
    });
  };

  const removeQuery = (id: string) => {
    setState((prev) =>
      prev.queries.length <= 1
        ? prev
        : { ...prev, queries: prev.queries.filter((q) => q.id !== id) }
    );
  };

  const updateQuery = (id: string, patch: Partial<MetricQueryDefinition>) => {
    setState((prev) => ({
      ...prev,
      queries: prev.queries.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
  };

  const updateQueryAggregation = (id: string, aggregation: MetricAggregation) =>
    updateQuery(id, { aggregation });

  const updateQueryMetric = (id: string, metricName: string) =>
    updateQuery(id, { metricName, where: [], groupBy: [] });

  const updateQueryWhere = (id: string, where: MetricTagFilter[]) => updateQuery(id, { where });

  const updateQueryGroupBy = (id: string, groupBy: string[]) => updateQuery(id, { groupBy });

  const addFormula = () => {
    formulaCounter++;
    setState((prev) => ({
      ...prev,
      formulas: [...prev.formulas, { id: `f${formulaCounter}`, expression: "" }],
    }));
  };

  const removeFormula = (id: string) => {
    setState((prev) => ({ ...prev, formulas: prev.formulas.filter((f) => f.id !== id) }));
  };

  const updateFormulaExpression = (id: string, expression: string) => {
    setState((prev) => ({
      ...prev,
      formulas: prev.formulas.map((f) => (f.id === id ? { ...f, expression } : f)),
    }));
  };

  const setTitle = (title: string) => setState((p) => ({ ...p, title }));
  const setViz = (viz: WidgetVizType) => setState((p) => ({ ...p, viz }));
  const setStep = (step: TimeStep) => setState((p) => ({ ...p, step }));
  const setSpaceAgg = (spaceAgg: MetricSpaceAggregation) => setState((p) => ({ ...p, spaceAgg }));
  const setSize = (size: WidgetSize) => setState((p) => ({ ...p, size }));
  const setDisplay = (patch: Partial<WidgetDisplayOptions>) =>
    setState((p) => ({ ...p, display: { ...p.display, ...patch } }));

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
