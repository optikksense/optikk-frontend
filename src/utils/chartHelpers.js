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
    },
  },
  scales: {
    x: {
      grid: { color: '#2D2D2D' },
      ticks: { color: '#666', maxRotation: 0 },
    },
    y: {
      grid: { color: '#2D2D2D' },
      ticks: { color: '#666' },
      beginAtZero: true,
    },
  },
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
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 4,
    borderWidth: 2,
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
 * @param {Array} data - Array of data objects
 * @param {string} timestampKey - Key name for the timestamp field
 */
export function formatChartLabels(data, timestampKey = 'timestamp') {
  return (data || []).map((d) => {
    const date = new Date(d[timestampKey]);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
}

/**
 * Get a color from the CHART_COLORS palette by index.
 * Wraps around if index exceeds palette length.
 */
export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}
