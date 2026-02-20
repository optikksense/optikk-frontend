/**
 * Utility functions for formatting data
 */

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num) {
  const value = Number(num);
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Format duration in milliseconds to human-readable format
 */
export function formatDuration(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value)) return '0ms';
  if (value < 1) {
    return `${(value * 1000).toFixed(0)}μs`;
  }
  if (value < 1000) {
    return `${value.toFixed(0)}ms`;
  }
  if (value < 60000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  return `${(value / 60000).toFixed(2)}m`;
}

/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a timestamp as relative time (e.g. "3m ago", "2h ago")
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatTimestamp(timestamp);
}

/**
 * Get the color for a service health status.
 */
export function getHealthColor(status) {
  const colors = {
    healthy: '#73C991',
    degraded: '#F79009',
    unhealthy: '#F04438',
    unknown: '#98A2B3',
  };
  return colors[status] || colors.unknown;
}

/**
 * Truncate text to maxLength, appending ellipsis if truncated.
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get error rate color based on threshold.
 */
export function getErrorRateColor(rate) {
  if (rate > 5) return '#F04438';
  if (rate > 1) return '#F79009';
  return '#73C991';
}
