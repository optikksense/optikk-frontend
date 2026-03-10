import type { ScaleOptionsByType } from 'chart.js';
import { APP_COLORS } from '@config/colorLiterals';
import { CHART_COLORS } from '@config/constants';

/**
 * Base Chart.js options for dark-themed observability charts.
 * Shared across RequestChart, ErrorRateChart, LatencyChart, and new chart components.
 */
export const BASE_CHART_OPTIONS: any = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: APP_COLORS.hex_1a1a1a_2,
      borderColor: APP_COLORS.hex_2d2d2d,
      borderWidth: 1,
      titleColor: APP_COLORS.hex_fff,
      bodyColor: APP_COLORS.rgba_255_255_255_0p8,
      padding: 10,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { color: APP_COLORS.rgba_255_255_255_0p05, tickLength: 0 },
      ticks: { color: APP_COLORS.hex_8e8e8e, maxRotation: 0, maxTicksLimit: 6, autoSkip: true, font: { size: 11 } },
      border: { display: false },
    } as ScaleOptionsByType<'category'>,
    y: {
      grid: { color: APP_COLORS.rgba_255_255_255_0p05, tickLength: 0 },
      ticks: { color: APP_COLORS.hex_8e8e8e, font: { size: 11 } },
      beginAtZero: true,
      border: { display: false },
    } as ScaleOptionsByType<'linear'>,
  },
  elements: {
    point: { radius: 0, hoverRadius: 4 },
    line: { borderWidth: 1.5, tension: 0.4, cubicInterpolationMode: 'monotone' },
  },
};

/**
 * Create chart options with custom y-axis formatting.
 * @param overrides - Options to merge with base options
 */
export function createChartOptions(overrides: Record<string, unknown> = {}): any {
  return {
    ...BASE_CHART_OPTIONS,
    ...overrides,
    plugins: {
      ...BASE_CHART_OPTIONS.plugins,
      ...(overrides.plugins || {}),
    },
    scales: {
      ...BASE_CHART_OPTIONS.scales,
      ...(overrides.scales || {}),
    },
  };
}

/**
 * Create a line dataset configuration.
 * @param label - Dataset label
 * @param data - Data points
 * @param color - Line color (hex)
 * @param fill - Whether to fill under the line
 */
export function createLineDataset(
  label: string,
  data: (number | null)[],
  color: string,
  fill: boolean = false
): any {
  const visiblePointCount = data.reduce((count: number, value: number | null) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue !== 0 ? count + 1 : count;
  }, 0);
  const isSparseSeries = visiblePointCount <= 1;

  return {
    label,
    data,
    borderColor: color,
    backgroundColor: fill ? `${color}1A` : 'transparent',
    fill,
    tension: 0.4,
    cubicInterpolationMode: 'monotone',
    pointRadius: 0,
    pointHoverRadius: 4,
    pointBackgroundColor: color,
    pointBorderColor: color,
    borderWidth: 1.5,
  };
}

/**
 * Create a bar dataset configuration.
 * @param label - Dataset label
 * @param data - Data points
 * @param color - Bar color (hex)
 */
export function createBarDataset(
  label: string,
  data: (number | null)[],
  color: string
): any {
  return {
    label,
    data,
    backgroundColor: `${color}CC`,
    borderColor: color,
    borderWidth: 1,
    borderRadius: 2,
  };
}

/**
 * Format timestamps array for chart x-axis labels.
 * @param data - Array of data objects
 * @param timestampKey - Key name for the timestamp field
 */
export function formatChartLabels<T extends Record<string, any>>(
  data: T[],
  timestampKey: string = 'timestamp'
): string[] {
  if (!data || data.length === 0) return [];

  const timestamps = data.map((d) => new Date(d[timestampKey] as string | number).getTime());
  const spanMs = Math.max(...timestamps) - Math.min(...timestamps);
  const DAY = 24 * 60 * 60 * 1000;

  return data.map((d) => {
    const date = new Date(d[timestampKey] as string | number);
    if (spanMs <= DAY) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (spanMs <= 7 * DAY) {
      return date.toLocaleDateString([], { weekday: 'short' }) +
        ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  });
}

/**
 * Get a color from the CHART_COLORS palette by index.
 * Wraps around if index exceeds palette length.
 * @param index
 */
export function getChartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Generate an array of ISO-formatted time bucket strings ("YYYY-MM-DD HH:mm:00")
 * spanning the full [startMs, endMs] range.
 *
 * Bucket size mirrors the backend's adaptive logic:
 * ≤ 3 h  →  1-minute buckets
 * ≤ 24 h →  5-minute buckets
 * > 24 h →  1-hour buckets
 * @param startMs - Start of the range in epoch millis
 * @param endMs   - End of the range in epoch millis
 * @returns Array of timestamp strings
 */
export function generateTimeBuckets(startMs: number, endMs: number) {
  const rangeMs = endMs - startMs;
  let stepMs;
  if (rangeMs <= 3 * 60 * 60 * 1000) {
    stepMs = 60 * 1000;          // 1 min
  } else if (rangeMs <= 24 * 60 * 60 * 1000) {
    stepMs = 5 * 60 * 1000;      // 5 min
  } else {
    stepMs = 60 * 60 * 1000;     // 1 hour
  }

  const alignedStart = Math.floor(startMs / stepMs) * stepMs;
  const buckets: string[] = [];
  for (let t = alignedStart; t <= endMs; t += stepMs) {
    buckets.push(new Date(t).toISOString());
  }
  return buckets;
}
