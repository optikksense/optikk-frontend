import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "./InfraMultiSeriesChart";

/** One chartable metric group served by a detail-page series endpoint. */
export interface ChartDef<G extends string = string> {
  readonly group: G;
  readonly title: string;
  readonly label: string;
  readonly format: "percentage" | "bytes" | "number";
}

/** Filters chart defs to groups the entity reports; null = still loading. */
export function availableCharts<G extends string>(
  charts: readonly ChartDef<G>[],
  availableMetrics: readonly string[] | null
): readonly ChartDef<G>[] {
  if (availableMetrics == null) return charts;
  return charts.filter((c) => availableMetrics.includes(c.group));
}

interface SeriesChartCardProps {
  readonly endpoint: string;
  readonly queryKeyPrefix: string;
  readonly def: ChartDef;
}

/** Chart card over a `{timeBucket, series, value}` series endpoint. */
export function SeriesChartCard({ endpoint, queryKeyPrefix, def }: SeriesChartCardProps) {
  return (
    <Card padding="md" className="min-h-[280px] border-border">
      <InfraMultiSeriesChart
        queryKey={`${queryKeyPrefix}.${def.group}`}
        endpoint={endpoint}
        title={def.title}
        groupByField="series"
        valueField="value"
        formatType={def.format}
        datasetLabel={def.label}
        extraParams={{ metric: def.group }}
      />
    </Card>
  );
}
