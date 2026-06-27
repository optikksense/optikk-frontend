import { AlertCircle, BarChart3 } from "lucide-react";
import { useMemo } from "react";

import { DeltaBadge } from "@/features/metrics/components/DeltaBadge";
import type {
  FormulaDefinition,
  MetricExplorerResults,
  MetricQueryDefinition,
  MetricQueryResult,
  MetricSeriesData,
} from "@/features/metrics/types";
import { buildSeries } from "@/features/metrics/utils/chartSeries";
import { formatStatValue } from "@/features/metrics/utils/formatStat";
import { computeQuerySummary, computeSeriesStats } from "@/features/metrics/utils/seriesStats";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import type { WidgetDisplayOptions, WidgetVizType } from "../builder/metricsWidget";

const MAX_SERIES = 100;

interface WidgetVizRendererProps {
  readonly viz: WidgetVizType;
  readonly queries: MetricQueryDefinition[];
  readonly formulas: FormulaDefinition[];
  readonly results: MetricExplorerResults | undefined;
  readonly display: WidgetDisplayOptions;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly height?: number;
}

/** Cell-sized WYSIWYG renderer shared by the editor preview and saved cards. */
export function WidgetVizRenderer({
  viz,
  queries,
  formulas,
  results,
  display,
  isLoading,
  isError,
  height = 220,
}: WidgetVizRendererProps) {
  const hasActiveQuery = queries.some((q) => q.metricName);
  const hasResults = !!results && Object.keys(results).length > 0;
  const data = results ?? {};

  if (!hasActiveQuery) return <CenteredState icon="empty" message="Select a metric to preview" />;
  if (isError) return <CenteredState icon="error" message="Failed to load data" />;
  if (isLoading && !hasResults) return <CenteredState icon="spinner" />;
  if (!hasResults) return <CenteredState icon="empty" message="No data for this query" />;

  switch (viz) {
    case "value":
      return <ValueViz queries={queries} results={data} height={height} />;
    case "toplist":
      return <ToplistViz queries={queries} results={data} />;
    case "table":
      return <TableViz queries={queries} results={data} />;
    default:
      return (
        <TimeseriesViz
          queries={queries}
          formulas={formulas}
          results={data}
          display={display}
          height={height}
        />
      );
  }
}

interface TimeseriesVizProps {
  readonly queries: MetricQueryDefinition[];
  readonly formulas: FormulaDefinition[];
  readonly results: MetricExplorerResults;
  readonly display: WidgetDisplayOptions;
  readonly height: number;
}

function TimeseriesViz({ queries, formulas, results, display, height }: TimeseriesVizProps) {
  const { timestamps, series } = useMemo(
    () => buildSeries(queries, formulas, results, "line"),
    [queries, formulas, results]
  );
  // Mirror the explorer's smoothing behavior for WYSIWYG parity.
  const adjusted = display.smooth ? series : series.map((s) => ({ ...s, width: 1 }));
  const rendered = adjusted.slice(0, MAX_SERIES);

  return (
    <ObservabilityChart
      timestamps={timestamps}
      series={rendered}
      type="line"
      height={height}
      legend={display.legend}
    />
  );
}

interface SingleQueryVizProps {
  readonly queries: MetricQueryDefinition[];
  readonly results: MetricExplorerResults;
}

function ValueViz({ queries, results, height }: SingleQueryVizProps & { readonly height: number }) {
  const primary = queries[0];
  const result = results[primary.id];
  const summary = computeQuerySummary(result, primary.spaceAggregation);
  const spark = useMemo(() => buildSeries([primary], [], results, "area"), [primary, results]);
  const sparkHeight = Math.min(64, Math.max(40, height - 96));

  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-2">
      <div className="font-mono font-semibold text-[28px] text-foreground leading-none">
        {formatStatValue(summary.current)}
      </div>
      <div className="flex items-center gap-2">
        <span className="truncate font-mono text-[11px] text-foreground-muted">
          {primary.aggregation}({primary.metricName})
        </span>
        <DeltaBadge delta={summary.delta} className="text-[10.5px]" />
      </div>
      {spark.series.length > 0 ? (
        <ObservabilityChart
          timestamps={spark.timestamps}
          series={spark.series}
          type="area"
          height={sparkHeight}
          yAxisSize={0}
          legend={false}
        />
      ) : null}
    </div>
  );
}

function ToplistViz({ queries, results }: SingleQueryVizProps) {
  const primary = queries[0];
  const rows = useMemo(
    () => buildRankedRows(results[primary.id], primary.metricName),
    [results, primary.id, primary.metricName]
  );
  if (rows.length === 0) return <CenteredState icon="empty" message="No series to rank" />;
  const max = rows[0].value;

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-y-auto px-1 py-1">
      {rows.map((row) => {
        const pct = Math.min(100, max > 0 ? (row.value / max) * 100 : 0);
        return (
          <div key={row.label} className="relative overflow-hidden rounded-[5px] px-2 py-1">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--color-primary-subtle-08)]"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-2">
              <span className="truncate font-mono text-[11px] text-foreground">{row.label}</span>
              <div className="flex shrink-0 items-center gap-2">
                <DeltaBadge delta={row.delta} className="text-[10px]" />
                <span className="font-mono font-semibold text-[11.5px] text-foreground">
                  {formatStatValue(row.value)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TableViz({ queries, results }: SingleQueryVizProps) {
  const primary = queries[0];
  const rows = useMemo(() => {
    const series = results[primary.id]?.series ?? [];
    return series.map((s) => ({
      label: seriesLabel(s, primary.metricName),
      stats: computeSeriesStats(s),
    }));
  }, [results, primary.id, primary.metricName]);
  if (rows.length === 0) return <CenteredState icon="empty" message="No data" />;

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-[11px]">
        <thead className="sticky top-0 bg-card text-foreground-muted">
          <tr>
            <th className="px-2 py-1 text-left font-medium">Series</th>
            <th className="px-2 py-1 text-right font-medium">Min</th>
            <th className="px-2 py-1 text-right font-medium">Avg</th>
            <th className="px-2 py-1 text-right font-medium">Max</th>
            <th className="px-2 py-1 text-right font-medium">Last</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-border border-t">
              <td className="max-w-0 truncate px-2 py-1 font-mono text-foreground">{row.label}</td>
              <td className="px-2 py-1 text-right font-mono text-foreground-secondary">
                {formatStatValue(row.stats.min)}
              </td>
              <td className="px-2 py-1 text-right font-mono text-foreground-secondary">
                {formatStatValue(row.stats.avg)}
              </td>
              <td className="px-2 py-1 text-right font-mono text-foreground-secondary">
                {formatStatValue(row.stats.max)}
              </td>
              <td className="px-2 py-1 text-right font-mono font-semibold text-foreground">
                {formatStatValue(row.stats.last)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RankedRow {
  readonly label: string;
  readonly value: number;
  readonly delta: number | null;
}

/** Ranks a query's series by their latest value, highest first. */
function buildRankedRows(result: MetricQueryResult | undefined, metricName: string): RankedRow[] {
  if (!result) return [];
  return result.series
    .map((s) => {
      const stats = computeSeriesStats(s);
      return { label: seriesLabel(s, metricName), value: stats.last ?? 0, delta: stats.delta };
    })
    .sort((a, b) => b.value - a.value);
}

function seriesLabel(series: MetricSeriesData, metricName: string): string {
  return Object.values(series.tags).join(", ") || metricName;
}

function CenteredState({
  icon,
  message,
}: {
  readonly icon: "empty" | "error" | "spinner";
  readonly message?: string;
}) {
  return (
    <div className="flex h-full min-h-[80px] flex-col items-center justify-center gap-2 text-center">
      {icon === "spinner" ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground-muted border-t-primary" />
      ) : icon === "error" ? (
        <AlertCircle size={20} className="text-error opacity-70" />
      ) : (
        <BarChart3 size={20} className="text-foreground-muted opacity-40" />
      )}
      {message ? <div className="text-[11.5px] text-foreground-muted">{message}</div> : null}
    </div>
  );
}
