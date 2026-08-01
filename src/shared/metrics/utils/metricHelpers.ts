import type { MetricAggregation, MetricNameEntry } from "@shared/metrics/types";

const isCumulativeCounter = (entry?: MetricNameEntry) =>
  entry?.temporality === "Cumulative" && entry.isMonotonic;

export function getValidAggregations(entry?: MetricNameEntry): MetricAggregation[] {
  if (isCumulativeCounter(entry)) return ["rate", "sum"];
  if (entry?.type === "histogram" || entry?.type === "exponential_histogram") {
    return ["avg", "sum", "count", "p50", "p95", "p99", "rate"];
  }
  if (entry?.type === "summary") return [];
  return ["avg", "sum", "min", "max", "count", "p50", "p95", "p99", "rate"];
}

export function getDefaultAggregationForMetric(
  entry?: MetricNameEntry,
  currentAgg?: MetricAggregation
): MetricAggregation {
  if (currentAgg && getValidAggregations(entry).includes(currentAgg)) return currentAgg;
  return isCumulativeCounter(entry) ? "rate" : "avg";
}
