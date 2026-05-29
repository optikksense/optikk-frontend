import { useMemo } from "react";

import { PageSurface } from "@shared/components/ui";

import type { MetricQueryResult } from "../types";
import { buildFleetDistribution } from "../utils/fleetDistribution";

interface FleetDistributionPanelProps {
  /** A group-by-host query result; each series is treated as one host. */
  readonly result: MetricQueryResult | undefined;
}

/** Density color from blue (low) to deep blue (high), matching the design legend. */
function densityColor(count: number, max: number): string {
  if (count === 0) return "var(--bg-secondary)";
  const intensity = Math.min(count / max, 1);
  // Interpolate light blue -> deep blue.
  const r = Math.round(219 - intensity * (219 - 29));
  const g = Math.round(234 - intensity * (234 - 78));
  const b = Math.round(254 - intensity * (254 - 216));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Fleet distribution heatmap: bins each host series' per-bucket value into
 * eight latency bands and colors cells by how many hosts land in each band per
 * time bucket. Derived entirely from the host-grouped query result.
 */
export function FleetDistributionPanel({ result }: FleetDistributionPanelProps) {
  const { points, bandLabels } = useMemo(() => buildFleetDistribution(result), [result]);

  const { buckets, max } = useMemo(() => {
    const seen: number[] = [];
    let maxCount = 1;
    for (const p of points) {
      const ts = Number(p.time_bucket);
      if (!seen.includes(ts)) seen.push(ts);
      if ((p.span_count ?? 0) > maxCount) maxCount = p.span_count ?? 0;
    }
    return { buckets: seen.sort((a, b) => a - b), max: maxCount };
  }, [points]);

  const countAt = (band: string, bucket: number): number =>
    points.find((p) => p.latency_bucket === band && Number(p.time_bucket) === bucket)?.span_count ??
    0;

  // Display bands high -> low (slowest at top), matching the design.
  const displayBands = [...bandLabels].reverse();

  return (
    <PageSurface padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-[15px] text-[var(--text-primary)] tracking-[0.01em]">
            Distribution across fleet
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--text-muted)]">
            p95 latency · binned per bucket · color = host density
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">0</span>
          <span
            className="h-2 w-[90px] rounded-[2px]"
            style={{
              background: "linear-gradient(90deg,#dbeafe,#bfdbfe,#93c5fd,#60a5fa,#3b82f6,#1d4ed8)",
            }}
          />
          <span className="text-[11px] text-[var(--text-muted)]">{max}+ hosts</span>
        </div>
      </div>

      {buckets.length === 0 ? (
        <div className="py-12 text-center text-[12px] text-[var(--text-muted)]">
          No fleet data — group a query by host to populate the distribution.
        </div>
      ) : (
        <div className="mt-3.5 flex flex-col gap-0.5">
          {displayBands.map((band) => (
            <div key={band} className="flex items-center gap-1">
              <div className="w-[72px] min-w-[72px] whitespace-nowrap pr-2 text-right text-[10.5px] text-[var(--text-muted)]">
                {band}
              </div>
              <div className="flex flex-1 gap-px">
                {buckets.map((bucket) => {
                  const count = countAt(band, bucket);
                  return (
                    <div
                      key={bucket}
                      title={`${band} · ${count} host${count === 1 ? "" : "s"}`}
                      className="h-5 flex-1 rounded-[2px]"
                      style={{ background: densityColor(count, max) }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
              earliest ──────── now
            </span>
          </div>
        </div>
      )}
    </PageSurface>
  );
}
