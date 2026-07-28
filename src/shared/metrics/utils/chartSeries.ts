import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";

import { QUERY_LABEL_COLORS } from "@shared/metrics/constants";
import type {
  ChartType,
  FormulaDefinition,
  MetricExplorerResults,
  MetricQueryDefinition,
} from "@shared/metrics/types";
import { getChartColor } from "@shared/utils/charting";
import { evaluateFormula } from "./formulaEvaluator";

const FORMULA_COLOR = "#f59e0b";

                                                                               
                                                                                
export function toRenderType(chartType: ChartType): "line" | "area" | "bar" {
  if (chartType === "bar") return "bar";
  if (chartType === "area" || chartType === "stack") return "area";
  return "line";
}

                                                                                
                                                                                  
export function buildSeries(
  queries: MetricQueryDefinition[],
  formulas: FormulaDefinition[],
  results: MetricExplorerResults,
  chartType: ChartType
): { timestamps: number[]; series: ObservabilityChartSeries[] } {
  const allSeries: ObservabilityChartSeries[] = [];
  let colorIdx = 0;

                                                                            
                                                                          
  const timestampSet = new Set<number>();
  for (const query of queries) {
    const result = results[query.id];
    if (!result) continue;
    for (const ts of result.timestamps) timestampSet.add(ts);
  }
  const timestamps = [...timestampSet].sort((a, b) => a - b);
  const indexOfTs = new Map(timestamps.map((ts, i) => [ts, i] as const));

  for (const query of queries) {
    const result = results[query.id];
    if (!result) continue;

    const baseColor = QUERY_LABEL_COLORS[query.id] ?? getChartColor(colorIdx);

    for (const series of result.series) {
                                                                     
      const values: Array<number | null> = timestamps.map(() => null);
      for (let i = 0; i < result.timestamps.length; i++) {
        const idx = indexOfTs.get(result.timestamps[i]);
        if (idx !== undefined) values[idx] = series.values[i] ?? null;
      }

      const tagLabel = Object.values(series.tags).join(", ");
      const label = tagLabel
        ? `${query.id}: ${query.aggregation}(${query.metricName}) [${tagLabel}]`
        : `${query.id}: ${query.aggregation}(${query.metricName})`;

      allSeries.push({
        label,
        values,
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
