import { Empty } from 'antd';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import { createChartOptions } from '@utils/chartHelpers';

import { LOG_LEVELS } from '@config/constants';

const LEVEL_ORDER = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

const LEVEL_COLORS: Record<string, string> = {
  TRACE: '#7e8ea0',
  DEBUG: '#4e9fdd',
  INFO: '#73bf69',
  WARN: '#e0b400',
  ERROR: '#e8494d',
  FATAL: '#c00021',
};

const LEGEND_ORDER = ['ERROR', 'INFO', 'WARN', 'DEBUG', 'FATAL', 'TRACE'];

const INTERVAL_MS: Record<string, number> = {
  '30s': 30_000, '1m': 60_000, '5m': 300_000, '15m': 900_000,
  '30m': 1_800_000, '1h': 3_600_000, '6h': 21_600_000,
};

function getBucketTimeValue(row: any) {
  return row?.timeBucket || row?.time_bucket || row?.timestamp;
}

function parseBucketMs(value: any) {
  const timeStr = String(value ?? '');
  const isSqlFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timeStr);
  return new Date(isSqlFormat ? timeStr.replace(' ', 'T') + 'Z' : timeStr).getTime();
}

function getPointCount(row: any) {
  const raw = row?.count ?? row?.total ?? row?.value ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function fmtTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtCount(n: any) {
  const val = Number(n);
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
  return val > 0 ? String(val) : '';
}

function generateAllBuckets(startTime: number, endTime: number, interval: string) {
  const step = INTERVAL_MS[interval] || 60_000;
  const buckets = [];
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
  const interval = extraContext?.interval || dataSources?._meta?.interval || '1m';

  return (
    <div className="lh-panel">
      <div className="lh-panel__header" onClick={() => setCollapsed((c) => !c)}>
        <span className="lh-panel__chevron">{collapsed ? '›' : 'v'}</span>
        <span className="lh-panel__title">{chartConfig.title || 'Logs volume'}</span>
      </div>
      {!collapsed && (
        <div className="lh-panel__body">
          {data.length > 0
            ? <LogHistogram data={data} height={height} startTime={startTime} endTime={endTime} interval={interval} />
            : <Empty description="No log data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 12 }} />
          }
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
export default function LogHistogram({ data = [], height = 80, startTime, endTime, interval = '1m' }: any) {
  const { labels, datasets, activeLevels, hasData } = useMemo(() => {
    if (!data || data.length === 0) {
      if (startTime && endTime) {
        const allBuckets = generateAllBuckets(startTime, endTime, interval);
        return {
          labels: allBuckets.map(fmtTime),
          datasets: [{
            label: 'logs', _level: 'INFO',
            data: allBuckets.map(() => 0),
            backgroundColor: LEVEL_COLORS.INFO,
            borderColor: 'transparent', borderWidth: 0, borderRadius: 0,
            stack: 'logs', barPercentage: 1.0, categoryPercentage: 1.0,
          }],
          activeLevels: [], hasData: true,
        };
      }
      return { labels: [], datasets: [], activeLevels: [], hasData: false };
    }

    const hasLevels = data.some((d: any) => d.level);

    let tStart = startTime; let tEnd = endTime;
    if (!tStart || !tEnd) {
      const allTs = (data as any[])
        .map((d) => parseBucketMs(getBucketTimeValue(d)))
        .filter((ts) => Number.isFinite(ts));
      if (allTs.length === 0) {
        return { labels: [], datasets: [], activeLevels: [], hasData: false };
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
        const lvl = String(d.level || 'INFO').toUpperCase();
        if (!countMap[bucketMs]) countMap[bucketMs] = {};
        countMap[bucketMs][lvl] = (countMap[bucketMs][lvl] || 0) + getPointCount(d);
      });

      const activeLevels = LEVEL_ORDER.filter(
        (lvl) => Object.values(countMap).some((cm) => (cm[lvl] || 0) > 0),
      );
      const labels = allBuckets.map(fmtTime);
      const datasets = (activeLevels.length > 0 ? activeLevels : ['INFO']).map((lvl) => ({
        label: (LOG_LEVELS as any)[lvl]?.label || lvl,
        _level: lvl,
        data: allBuckets.map((b) => countMap[b]?.[lvl] || 0),
        backgroundColor: LEVEL_COLORS[lvl] || '#98A2B3',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0,
        stack: 'logs',
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      }));

      return { labels, datasets, activeLevels, hasData: true };
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
      labels: allBuckets.map(fmtTime),
      datasets: [{
        label: 'logs', _level: 'INFO',
        data: allBuckets.map((b) => countByBucket[b] || 0),
        backgroundColor: LEVEL_COLORS.INFO,
        borderColor: 'transparent', borderWidth: 0, borderRadius: 0,
        stack: 'logs', barPercentage: 1.0, categoryPercentage: 1.0,
      }],
      activeLevels: ['INFO'],
      hasData: true,
    };
  }, [data, startTime, endTime, interval]);

  if (!hasData) return null;

  const legendLevels = LEGEND_ORDER.filter((l) => activeLevels.includes(l));

  const options = createChartOptions({
    animation: false,
    layout: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#12131A',
        borderColor: '#2D2D2D',
        borderWidth: 1,
        titleColor: '#D1D5DB',
        bodyColor: '#9CA3AF',
        padding: 8,
        callbacks: {
          title: (items: any) => items[0]?.label || '',
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
          footer: (items: any) => {
            const t = items.reduce((s: number, i: any) => s + i.parsed.y, 0);
            return t > 0 ? ` Total: ${t.toLocaleString()}` : '';
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        border: { color: '#2D2D2D' },
        ticks: {
          color: '#6B7280',
          maxTicksLimit: 18,
          maxRotation: 0,
          font: { size: 10 },
        },
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255,255,255,0.04)', lineWidth: 1 },
        border: { display: false },
        ticks: {
          color: '#6B7280',
          maxTicksLimit: 4,
          font: { size: 10 },
          callback: fmtCount,
        },
        beginAtZero: true,
      },
    },
  });

  return (
    <div className="lh-chart-wrap">
      <div style={{ height }}>
        <Bar data={{ labels, datasets }} options={options} />
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
