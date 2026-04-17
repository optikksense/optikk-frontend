import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

export interface SummaryTile {
  label: string;
  beforeValue?: number | null;
  afterValue: number;
  delta: number;
  formatter: (value: number) => string;
  invertDelta?: boolean;
}

function tile(
  label: string,
  before: number | null | undefined,
  after: number,
  formatter: (v: number) => string,
  invertDelta = false
): SummaryTile {
  return {
    label,
    beforeValue: before,
    afterValue: after,
    delta: after - (before ?? 0),
    formatter,
    invertDelta,
  };
}

/**
 * Pure view-model builder for the 5 deployment-compare summary tiles.
 * Directly unit-testable without mounting the UI.
 */
export function buildSummaryTiles(compare: DeploymentCompareResponse): SummaryTile[] {
  const b = compare.summary.before;
  const a = compare.summary.after;
  return [
    tile("Requests", b?.request_count, a.request_count, formatNumber),
    tile("Errors", b?.error_count, a.error_count, formatNumber),
    tile("Error Rate", b?.error_rate, a.error_rate, formatPercentage, true),
    tile("P95", b?.p95_ms, a.p95_ms, formatDuration, true),
    tile("P99", b?.p99_ms, a.p99_ms, formatDuration, true),
  ];
}
