import { useMemo, useState } from "react";
import type uPlot from "uplot";

import { APP_COLORS } from "@config/colorLiterals";
import { LOG_LEVELS } from "@config/constants";

import UPlotChart, { uBars } from "../UPlotChart";

const LEVEL_ORDER = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

const LEVEL_COLORS: Record<string, string> = {
  TRACE: APP_COLORS.hex_7e8ea0,
  DEBUG: APP_COLORS.hex_4e9fdd,
  INFO: APP_COLORS.hex_73bf69,
  WARN: APP_COLORS.hex_e0b400,
  ERROR: APP_COLORS.hex_e8494d,
  FATAL: APP_COLORS.hex_c00021,
};

const LEGEND_ORDER = ["ERROR", "INFO", "WARN", "DEBUG", "FATAL", "TRACE"];

const INTERVAL_MS: Record<string, number> = {
  "30s": 30_000,
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "6h": 21_600_000,
};

function getBucketTimeValue(row: any) {
  return row?.timeBucket || row?.time_bucket || row?.timestamp;
}

function parseBucketMs(value: any) {
  const timeStr = String(value ?? "");
  const isSqlFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timeStr);
  return new Date(isSqlFormat ? `${timeStr.replace(" ", "T")}Z` : timeStr).getTime();
}

function getPointCount(row: any) {
  const raw = row?.count ?? row?.total ?? row?.value ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function fmtTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtCount(n: any) {
  const val = Number(n);
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
  return val > 0 ? String(val) : "";
}

function generateAllBuckets(startTime: number, endTime: number, interval: string) {
  const step = INTERVAL_MS[interval] || 60_000;
  const buckets: number[] = [];
  const alignedStart = Math.floor(startTime / step) * step;
  for (let t = alignedStart; t <= endTime; t += step) {
    buckets.push(t);
  }
  if (buckets.length < 20) {
    const min = buckets[0] || startTime;
    const smallStep = Math.max(1000, Math.floor((endTime - min) / 20));
    buckets.length = 0;
    for (let t = min; t <= endTime; t += smallStep) buckets.push(t);
  }
  return buckets;
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 * @param root0.extraContext
 */
export function LogHistogramPanel({ chartConfig, dataSources, extraContext = {} }: any) {
  const [collapsed, setCollapsed] = useState(false);
  const rawData = dataSources?.[chartConfig.dataSource];
  const data = useMemo(() => {
    const arr = chartConfig.dataKey ? rawData?.[chartConfig.dataKey] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const height = chartConfig.height || 80;

  const startTime = extraContext?.startTime || dataSources?._meta?.startTime;
  const endTime = extraContext?.endTime || dataSources?._meta?.endTime;
  const interval = extraContext?.interval || dataSources?._meta?.interval || "1m";

  return (
    <div className="lh-panel">
      <div className="lh-panel__header" onClick={() => setCollapsed((c) => !c)}>
        <span className="lh-panel__chevron">{collapsed ? "›" : "v"}</span>
        <span className="lh-panel__title">{chartConfig.title || "Logs volume"}</span>
      </div>
      {!collapsed && (
        <div className="lh-panel__body">
          {data.length > 0 ? (
            <LogHistogram
              data={data}
              height={height}
              startTime={startTime}
              endTime={endTime}
              interval={interval}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 12, color: "var(--text-muted)" }}>
              No log data
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.height
 * @param root0.startTime
 * @param root0.endTime
 * @param root0.interval
 */
export default function LogHistogram({
  data = [],
  height = 180,
  startTime,
  endTime,
  interval = "1m",
  fillHeight = false,
}: any) {
  const { allBuckets, seriesData, activeLevels, hasData } = useMemo(() => {
    if (!data || data.length === 0) {
      if (startTime && endTime) {
        const allBuckets = generateAllBuckets(startTime, endTime, interval);
        return {
          allBuckets,
          seriesData: [{ level: "INFO", data: allBuckets.map(() => 0) }],
          activeLevels: [] as string[],
          hasData: true,
        };
      }
      return {
        allBuckets: [] as number[],
        seriesData: [],
        activeLevels: [] as string[],
        hasData: false,
      };
    }

    const hasLevels = data.some((d: any) => d.level);

    let tStart = startTime;
    let tEnd = endTime;
    if (!tStart || !tEnd) {
      const allTs = (data as any[])
        .map((d) => parseBucketMs(getBucketTimeValue(d)))
        .filter((ts) => Number.isFinite(ts));
      if (allTs.length === 0) {
        return { allBuckets: [] as number[], seriesData: [], activeLevels: [], hasData: false };
      }
      tStart = Math.min(...allTs);
      tEnd = Math.max(...allTs);
    }

    const allBuckets = generateAllBuckets(tStart, tEnd, interval);

    if (hasLevels) {
      const countMap: Record<number, Record<string, number>> = {};
      const stepMs = INTERVAL_MS[interval] || 60_000;

      (data as any[]).forEach((d) => {
        const ts = parseBucketMs(getBucketTimeValue(d));
        if (!Number.isFinite(ts)) return;
        const bucketMs = Math.round(ts / stepMs) * stepMs;
        const lvl = String(d.level || "INFO").toUpperCase();
        if (!countMap[bucketMs]) countMap[bucketMs] = {};
        countMap[bucketMs][lvl] = (countMap[bucketMs][lvl] || 0) + getPointCount(d);
      });

      const activeLevels = LEVEL_ORDER.filter((lvl) =>
        Object.values(countMap).some((cm) => (cm[lvl] || 0) > 0)
      );
      const levels = activeLevels.length > 0 ? activeLevels : ["INFO"];
      const seriesData = levels.map((lvl) => ({
        level: lvl,
        label: (LOG_LEVELS as any)[lvl]?.label || lvl,
        data: allBuckets.map((b) => countMap[b]?.[lvl] || 0),
      }));

      return { allBuckets, seriesData, activeLevels, hasData: true };
    }

    const stepMs = INTERVAL_MS[interval] || 60_000;
    const countByBucket: Record<number, number> = {};
    (data as any[]).forEach((d) => {
      const ts = parseBucketMs(getBucketTimeValue(d));
      if (!Number.isFinite(ts)) return;
      const bucketMs = Math.round(ts / stepMs) * stepMs;
      countByBucket[bucketMs] = (countByBucket[bucketMs] || 0) + getPointCount(d);
    });

    return {
      allBuckets,
      seriesData: [
        {
          level: "INFO",
          label: "logs",
          data: allBuckets.map((b) => countByBucket[b] || 0),
        },
      ],
      activeLevels: ["INFO"],
      hasData: true,
    };
  }, [data, startTime, endTime, interval]);

  const chartPlot = useMemo(() => {
    if (!hasData || seriesData.length === 0) {
      return null;
    }

    const stackedSeriesValues: number[][] = [];
    for (let si = 0; si < seriesData.length; si++) {
      const cumulative = seriesData[si].data.map((val, bi) => {
        let sum = val;
        for (let below = 0; below < si; below++) {
          sum += seriesData[below].data[bi];
        }
        return sum;
      });
      stackedSeriesValues.push(cumulative);
    }

    const reversedSeries = [...seriesData].reverse();
    const reversedStacked = [...stackedSeriesValues].reverse();
    const xValues = allBuckets.map((ms) => ms / 1000);
    const uplotData: uPlot.AlignedData = [xValues, ...reversedStacked];
    const timeLabels = allBuckets.map(fmtTime);

    const chartOpts: Omit<uPlot.Options, "width" | "height"> = {
      axes: [
        {
          stroke: APP_COLORS.hex_6b7280_2,
          grid: { show: false },
          ticks: { show: false },
          font: "10px inherit",
          values: (_u: uPlot, splits: number[]) =>
            splits.map((s) => {
              const idx = xValues.indexOf(s);
              return idx >= 0 ? timeLabels[idx] : "";
            }),
        },
        {
          stroke: APP_COLORS.hex_6b7280_2,
          grid: { stroke: "rgba(255,255,255,0.04)", width: 1 },
          ticks: { show: false },
          font: "10px inherit",
          size: 40,
          values: (_u: uPlot, splits: number[]) => splits.map(fmtCount),
        },
      ],
      cursor: { show: true },
      legend: { show: false },
      series: [
        {},
        ...reversedSeries.map((s) =>
          uBars((s as any).label || s.level, LEVEL_COLORS[s.level] || APP_COLORS.hex_98a2b3)
        ),
      ],
    };

    return { uplotData, opts: chartOpts };
  }, [allBuckets, seriesData, hasData]);

  if (!hasData || !chartPlot) return null;

  const legendLevels = LEGEND_ORDER.filter((l) => activeLevels.includes(l));
  const { uplotData, opts } = chartPlot;

  return (
    <div className="lh-chart-wrap h-full min-h-0">
      <div
        className={fillHeight ? "h-full min-h-0" : undefined}
        style={fillHeight ? undefined : { height }}
      >
        <UPlotChart options={opts} data={uplotData} height={height} fillHeight={fillHeight} />
      </div>
      {legendLevels.length > 0 && (
        <div className="lh-legend">
          {legendLevels.map((lvl) => (
            <span key={lvl} className="lh-legend__item">
              <span className="lh-legend__dot" style={{ background: LEVEL_COLORS[lvl] }} />
              {((LOG_LEVELS as any)[lvl]?.label || lvl).toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
