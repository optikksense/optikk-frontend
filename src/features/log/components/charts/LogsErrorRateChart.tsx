import { AlertCircle } from "lucide-react";
import { useMemo } from "react";

import { CHART_COLORS } from "@config/constants";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import type { LogAggregateRow } from "../../types";

interface LogsErrorRateChartProps {
  rows: LogAggregateRow[];
  isLoading: boolean;
}

export default function LogsErrorRateChart({ rows, isLoading }: LogsErrorRateChartProps) {
  const { buckets, series, yMax } = useMemo(() => {
    const bucketMap = new Map<string, Record<string, number>>();
    const serviceSet = new Set<string>();

    for (const row of rows) {
      const bucket = row.time_bucket;
      if (!bucketMap.has(bucket)) {
        bucketMap.set(bucket, {});
      }

      bucketMap.get(bucket)![row.group_value] = row.error_rate ?? 0;
      serviceSet.add(row.group_value);
    }

    const sortedBuckets = Array.from(bucketMap.keys()).sort();
    const services = Array.from(serviceSet);
    const maxValue = Math.max(
      0,
      ...sortedBuckets.flatMap((bucket) =>
        services.map((service) => Number(bucketMap.get(bucket)?.[service] ?? 0))
      )
    );

    return {
      buckets: sortedBuckets,
      series: services.map((service, index) => ({
        label: service,
        color: CHART_COLORS[index % CHART_COLORS.length],
        values: sortedBuckets.map((bucket) => Number(bucketMap.get(bucket)?.[service] ?? 0)),
      })),
      yMax: Math.min(Math.max(Math.ceil(maxValue * 1.2), 1), 100),
    };
  }, [rows]);

  if (isLoading) {
    return (
      <div className="flex h-[180px] items-center justify-center">
        <div className="ok-spinner" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[12px] text-[var(--text-secondary)]">
        No error rate data
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-1.5 border-[var(--border-color)] border-b px-3 py-2 font-semibold text-[14px] text-[var(--text-primary)]">
        <AlertCircle size={14} />
        <span>Error Rate by Service (%)</span>
      </div>
      <div className="px-2 py-2" style={{ height: 180 }}>
        <ObservabilityChart
          timestamps={buckets.map((bucket) => new Date(bucket).getTime() / 1000)}
          series={series}
          height={164}
          yMin={0}
          yMax={yMax}
          yFormatter={(value) => (Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`)}
        />
      </div>
    </div>
  );
}
