import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercentage,
} from "@shared/utils/formatters";

/** Value shape of an infrastructure metric series, shared by its chart and list. */
export type SeriesFormat = "bytes" | "percentage" | "duration" | "number";

/**
 * Single formatter for infra series values, so the y-axis and the series list
 * under it always render the same number the same way.
 */
export function formatSeriesValue(value: number, format: SeriesFormat): string {
  switch (format) {
    case "bytes":
      return formatBytes(value);
    case "percentage":
      return formatPercentage(value, 2, false);
    case "duration":
      return formatDuration(value);
    default:
      return formatNumber(value);
  }
}
