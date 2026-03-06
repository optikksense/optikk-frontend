import { Tooltip } from 'antd';
import { useMemo } from 'react';

import './LatencyHeatmapChart.css';

const LATENCY_BUCKETS = ['0-50ms', '50-100ms', '100-250ms', '250-500ms', '500ms-1s', '>1s'];

interface LatencyHeatmapDataPoint {
  time_bucket: string | number;
  latency_bucket: string;
  span_count?: number;
}

interface LatencyHeatmapChartProps {
  data?: LatencyHeatmapDataPoint[];
}

/**
 * 2D latency heatmap: time on X axis, latency bucket on Y axis, color intensity = span count.
 * Props:
 *   data: Array<{ time_bucket, latency_bucket, span_count }>
 * @param props Component props.
 * @returns Heatmap chart for latency bucket density by time.
 */
export default function LatencyHeatmapChart({
  data = [],
}: LatencyHeatmapChartProps): JSX.Element {
  const timeBuckets = useMemo(() =>
    [...new Set(data.map((d) => d.time_bucket))].sort(),
    [data],
  );

  const maxCount = useMemo(() =>
    Math.max(...data.map((d) => Number(d.span_count) || 0), 1),
    [data],
  );

  const getColor = (count: number): string => {
    const n = Number(count) || 0;
    if (n === 0) return 'var(--bg-secondary, #1a1a2e)';
    const intensity = Math.min(n / maxCount, 1);
    // Interpolate from blue-teal (low) to deep red (high) via orange
    const r = Math.round(30 + intensity * 187);
    const g = Math.round(100 * (1 - intensity));
    const b = Math.round(180 * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
        No latency data available
      </div>
    );
  }

  return (
    <div className="latency-heatmap">
      <div className="heatmap-grid">
        {LATENCY_BUCKETS.map((lb) => (
          <div key={lb} className="heatmap-row">
            <div className="heatmap-y-label">{lb}</div>
            <div className="heatmap-cells">
              {timeBuckets.map((tb) => {
                const cell = data.find(
                  (d) => d.latency_bucket === lb && String(d.time_bucket) === String(tb),
                );
                const count = Number(cell?.span_count) || 0;
                return (
                  <Tooltip
                    key={String(tb)}
                    title={`${lb} @ ${new Date(tb).toLocaleTimeString()}: ${count.toLocaleString()} spans`}
                  >
                    <div
                      className="heatmap-cell"
                      style={{ background: getColor(count) }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="heatmap-x-axis">
        <div className="heatmap-y-label-spacer" />
        <div className="heatmap-x-labels">
          {timeBuckets
            .filter((_, i) => i % Math.max(1, Math.floor(timeBuckets.length / 8)) === 0)
            .map((tb) => (
              <span key={String(tb)} className="heatmap-x-label">
                {new Date(tb).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Low</span>
        <div className="heatmap-legend-bar" />
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>High</span>
      </div>
    </div>
  );
}
