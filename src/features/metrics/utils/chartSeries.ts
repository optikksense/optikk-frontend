import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";

import { getChartColor } from "@shared/utils/charting";
import { QUERY_LABEL_COLORS } from "../constants";
import type {
  ChartType,
  FormulaDefinition,
  MetricExplorerResults,
  MetricQueryDefinition,
} from "../types";
import { evaluateFormula } from "./formulaEvaluator";

const FORMULA_COLOR = "#f59e0b";

/** Underlying renderable type for the uPlot-backed chart. "stack" renders as a
 * filled area; "heat"/"top" are handled by sibling panels, never this chart. */
export function toRenderType(chartType: ChartType): "line" | "area" | "bar" {
  if (chartType === "bar") return "bar";
  if (chartType === "area" || chartType === "stack") return "area";
  return "line";
}

/** Maps query + formula results into uPlot-ready timestamps + series. Shared by
 * the metrics explorer chart and dashboard widget renderer for WYSIWYG parity. */
export function buildSeries(
  queries: MetricQueryDefinition[],
  formulas: FormulaDefinition[],
  results: MetricExplorerResults,
  chartType: ChartType
): { timestamps: number[]; series: ObservabilityChartSeries[] } {
  const allSeries: ObservabilityChartSeries[] = [];
  let timestamps: number[] = [];
  let colorIdx = 0;

  for (const query of queries) {
    const result = results[query.id];
    if (!result) continue;

    if (result.timestamps.length > timestamps.length) {
      timestamps = result.timestamps;
    }

    const baseColor = QUERY_LABEL_COLORS[query.id] ?? getChartColor(colorIdx);

    for (const series of result.series) {
      const tagLabel = Object.values(series.tags).join(", ");
      const label = tagLabel
        ? `${query.id}: ${query.aggregation}(${query.metricName}) [${tagLabel}]`
        : `${query.id}: ${query.aggregation}(${query.metricName})`;

      allSeries.push({
        label,
        values: series.values,
        color: result.series.length > 1 ? getChartColor(colorIdx) : baseColor,
        fill: toRenderType(chartType) === "area",
      });
      colorIdx++;
    }
  }

  for (const formula of formulas) {
    if (!formula.expression.trim()) continue;
    const values = evaluateFormula(formula.expression, results, timestamps);
    allSeries.push({
      label: `${formula.id}: ${formula.expression}`,
      values,
      color: FORMULA_COLOR,
      fill: false,
      dash: [6, 3],
    });
  }

  return { timestamps, series: allSeries };
}
