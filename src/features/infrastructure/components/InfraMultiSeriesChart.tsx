import { memo, useMemo, useState } from "react";

import RequestChart from "@shared/components/ui/charts/time-series/RequestChart";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { firstValue } from "@shared/utils/chartDataUtils";

import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { formatBytes, formatPercentage, formatDuration } from "@shared/utils/formatters";
import { CHART_COLORS } from "@config/constants";

import { infraGet } from "../api/infrastructureApi";
import InfraSeriesList, { type InfraSeriesListItem } from "./InfraSeriesList";

interface ChartRow {
  readonly [key: string]: unknown;
}

interface InfraMultiSeriesChartProps {
  readonly queryKey: string;
  readonly endpoint: string;
  readonly title: string;
  readonly groupByField: string;
  readonly valueField?: string;
  readonly height?: number;
  readonly datasetLabel?: string;
  readonly formatType?: "bytes" | "percentage" | "duration" | "number";
  readonly extraParams?: Record<string, string | number | undefined>;
}

function buildSeriesMap(rows: ChartRow[], groupByField: string): Record<string, ChartRow[]> {
  const map: Record<string, ChartRow[]> = {};
  for (const row of rows) {
    const key = String(
      firstValue(row, [groupByField, "pod", "container", "state", "direction"], "") || "unknown"
    );
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }
  return map;
}

export default memo(function InfraMultiSeriesChart({
  queryKey,
  endpoint,
  title,
  groupByField,
  valueField = "value",
  height = 260,
  datasetLabel = "Value",
  formatType = "number",
  extraParams,
}: InfraMultiSeriesChartProps) {
  const { timeBuckets } = useChartTimeBuckets();
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);

  const toggleSeries = (key: string) => {
    setSelectedSeries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const extraParamsKey = JSON.stringify(extraParams ?? {});
  const q = useTimeRangeQuery<ChartRow[]>(
    `${queryKey}|${extraParamsKey}`,
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<ChartRow[]>(
        endpoint,
        teamId,
        Number(start),
        Number(end),
        extraParams
      );
      return Array.isArray(data) ? data : [];
    }
  );

  const serviceTimeseriesMap = useMemo(
    () => buildSeriesMap(q.data ?? [], groupByField),
    [q.data, groupByField]
  );

  const seriesSummary = useMemo<InfraSeriesListItem[]>(() => {
    return Object.entries(serviceTimeseriesMap)
      .slice(0, 10)
      .map(([name, rows], idx) => {
      // Use latest non-null value for current usage
      let latestValue = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        const val = Number(firstValue(rows[i], [valueField, "value", "request_count"], 0));
        if (Number.isFinite(val) && val !== 0) {
          latestValue = val;
          break;
        }
      }
      return {
        key: name,
        label: name,
        value: latestValue,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
  }, [serviceTimeseriesMap, valueField]);

  const hasData = useMemo(() => {
    const rows = q.data ?? [];
    if (rows.length === 0) return false;
    return rows.some((row) => {
      const ts = firstValue(row, ["timestamp", "time_bucket"], "");
      if (!ts) return false;
      const v = Number(firstValue(row, [valueField, "value", "request_count"], 0));
      return Number.isFinite(v);
    });
  }, [q.data, valueField]);

  if (q.isPending && q.data === undefined) {
    return (
      <div className="flex h-[260px] items-center justify-center text-[13px] text-[var(--text-muted)]">
        Loading…
      </div>
    );
  }

  if (!hasData && timeBuckets.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-[13px] text-[var(--text-muted)]">
        No data in range
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="font-medium text-[13px] text-[var(--text-primary)]">{title}</div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-[58%] shrink-0">
          <RequestChart
            data={[]}
            serviceTimeseriesMap={serviceTimeseriesMap}
            height={height}
            datasetLabel={datasetLabel}
            valueKey={valueField}
            fillHeight={false}
            legend={false}
            selectedEndpoints={selectedSeries}
            yFormatter={
              formatType === "bytes"
                ? (val) => formatBytes(val)
                : formatType === "percentage"
                  ? (val) => formatPercentage(val, 2, false)
                  : formatType === "duration"
                    ? (val) => formatDuration(val)
                    : undefined
            }
          />
        </div>
        <InfraSeriesList
          series={seriesSummary}
          selectedKeys={selectedSeries}
          onToggle={toggleSeries}
          formatType={formatType}
          title={datasetLabel}
        />
      </div>
    </div>
  );
});
