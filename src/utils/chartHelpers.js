import { CHART_COLORS, UI_CONFIG } from '@config/constants';

/**
 * Base Chart.js options for dark-themed observability charts.
 * Shared across RequestChart, ErrorRateChart, LatencyChart, and new chart components.
 */
export const BASE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#1A1A1A',
      borderColor: '#2D2D2D',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      padding: 10,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)', tickLength: 0 },
      ticks: { color: '#8e8e8e', maxRotation: 0, maxTicksLimit: 12, autoSkip: true, font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)', tickLength: 0 },
      ticks: { color: '#8e8e8e', font: { size: 11 } },
      beginAtZero: true,
      border: { display: false },
    },
  },
  elements: {
    point: { radius: 0, hoverRadius: 0 },
    line: { borderWidth: 1.5, tension: 0.1 }
  }
};

/**
 * Create chart options with custom y-axis formatting.
 * @param {Object} overrides - Options to merge with base options
 */
export function createChartOptions(overrides = {}) {
  return {
    ...BASE_CHART_OPTIONS,
    ...overrides,
    plugins: {
      ...BASE_CHART_OPTIONS.plugins,
      ...overrides.plugins,
    },
    scales: {
      ...BASE_CHART_OPTIONS.scales,
      ...overrides.scales,
    },
  };
}

/**
 * Create a line dataset configuration.
 * @param {string} label - Dataset label
 * @param {Array} data - Data points
 * @param {string} color - Line color (hex)
 * @param {boolean} fill - Whether to fill under the line
 */
export function createLineDataset(label, data, color, fill = false) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: fill ? `${color}1A` : 'transparent',
    fill,
    tension: 0.1,
    pointRadius: 0,
    pointHoverRadius: 0,
    borderWidth: 1.5,
  };
}

/**
 * Create a bar dataset configuration.
 * @param {string} label - Dataset label
 * @param {Array} data - Data points
 * @param {string} color - Bar color (hex)
 */
export function createBarDataset(label, data, color) {
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
 * Adapts format to the data's time span:
 *   - ≤24h  → "HH:mm"
 *   - ≤7d   → "Mon HH:mm"
 *   - >7d   → "Jan 01"
 *
 * @param {Array} data - Array of data objects
 * @param {string} timestampKey - Key name for the timestamp field
 */
export function formatChartLabels(data, timestampKey = 'timestamp') {
  if (!data || data.length === 0) return [];

  const timestamps = data.map(d => new Date(d[timestampKey]).getTime());
  const spanMs = Math.max(...timestamps) - Math.min(...timestamps);
  const DAY = 24 * 60 * 60 * 1000;

  return data.map((d) => {
    const date = new Date(d[timestampKey]);
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
 */
export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Generate an array of ISO-formatted time bucket strings ("YYYY-MM-DD HH:mm:00")
 * spanning the full [startMs, endMs] range.
 *
 * Bucket size mirrors the backend's adaptive logic:
 *   ≤ 2 h  →  1-minute buckets
 *   ≤ 24 h →  5-minute buckets
 *   > 24 h →  1-hour buckets
 *
 * @param {number} startMs - Start of the range in epoch millis
 * @param {number} endMs   - End of the range in epoch millis
 * @returns {string[]} Array of timestamp strings
 */
export function generateTimeBuckets(startMs, endMs) {
  const rangeMs = endMs - startMs;
  let stepMs;
  if (rangeMs <= 2 * 60 * 60 * 1000) {
    stepMs = 60 * 1000;          // 1 min
  } else if (rangeMs <= 24 * 60 * 60 * 1000) {
    stepMs = 5 * 60 * 1000;      // 5 min
  } else {
    stepMs = 60 * 60 * 1000;     // 1 hour
  }

  const alignedStart = Math.floor(startMs / stepMs) * stepMs;
  const buckets = [];
  for (let t = alignedStart; t <= endMs; t += stepMs) {
    const d = new Date(t);
    const iso = d.getFullYear() +
      '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0') +
      ' ' + String(d.getHours()).padStart(2, '0') +
      ':' + String(d.getMinutes()).padStart(2, '0') +
      ':00';
    buckets.push(iso);
  }
  return buckets;
}
