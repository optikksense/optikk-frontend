/**
 * Fix 18: BurnRateChart
 * Renders an SLO burn rate gauge + trend sparkline.
 * Shows the 1h and 6h burn rate windows with threshold indicators.
 */
import { Surface } from '@/components/ui';
import React, { useMemo } from 'react';
import uPlot from 'uplot';
import { getResolvedChartPalette, resolveThemeColor } from '@shared/utils/chartTheme';

import UPlotChart, { defaultAxes, uLine } from '../UPlotChart';

/**
 *
 */
export interface BurnRatePoint {
  ts: string; // display label
  burnRate1h: number; // current 1h window
  burnRate6h: number; // current 6h window
}

interface BurnRateChartProps {
  data: BurnRatePoint[];
  fastBurnThreshold?: number; // e.g. 14.4 (for 2% budget in 1h = 14.4x burn)
  slowBurnThreshold?: number; // e.g. 1.0
  sloTarget?: number; // e.g. 99.9
  title?: string;
}

function burnRateColor(rate: number, fast: number, slow: number): string {
  if (rate >= fast) return resolveThemeColor('--severity-critical', '#f04438');
  if (rate >= slow) return resolveThemeColor('--severity-high', '#f79009');
  return resolveThemeColor('--severity-low', '#3b82f6');
}

const BurnRateChart: React.FC<BurnRateChartProps> = ({
  data,
  fastBurnThreshold = 14.4,
  slowBurnThreshold = 1.0,
  sloTarget = 99.9,
  title = 'SLO Burn Rate',
}) => {
  const latest = data[data.length - 1];
  const current1h = latest?.burnRate1h ?? 0;
  const current6h = latest?.burnRate6h ?? 0;
  const [primaryColor, secondaryColor] = getResolvedChartPalette();

  const tsLabels = data.map((d) => d.ts);

  const uplotData = useMemo<uPlot.AlignedData>(
    () => [data.map((_, i) => i), data.map((d) => d.burnRate1h), data.map((d) => d.burnRate6h)],
    [data]
  );

  const opts = useMemo<Omit<uPlot.Options, 'width' | 'height'>>(() => {
    const axes = defaultAxes();
    // Override x-axis to show ts labels
    axes[0] = {
      ...axes[0],
      values: (_u: uPlot, splits: number[]) => splits.map((i) => tsLabels[Math.round(i)] ?? ''),
    };
    // Override y-axis label size
    axes[1] = { ...axes[1], size: 28 };

    return {
      axes,
      cursor: { show: true },
      legend: { show: false },
      scales: { x: { range: (_u, min, max) => [min, max] as [number, number] } },
      series: [
        {},
        uLine('1h', primaryColor, { width: 2 }),
        uLine('6h', secondaryColor, { dash: [4, 4], width: 2 }),
      ],
    };
  }, [primaryColor, secondaryColor, tsLabels]);

  return (
    <Surface className="chart-card" padding="sm">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>1h Burn Rate</div>
          <div
            style={{
              fontSize: 'var(--text-xl)',
              color: burnRateColor(current1h, fastBurnThreshold, slowBurnThreshold),
              fontWeight: 'var(--font-bold)',
            }}
          >
            {current1h.toFixed(2)}×
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>6h Burn Rate</div>
          <div
            style={{
              fontSize: 'var(--text-xl)',
              color: burnRateColor(current6h, fastBurnThreshold * 0.5, slowBurnThreshold),
              fontWeight: 'var(--font-bold)',
            }}
          >
            {current6h.toFixed(2)}×
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>SLO Target</div>
          <div
            style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--color-success)',
              fontWeight: 'var(--font-bold)',
            }}
          >
            {sloTarget}%
          </div>
        </div>
      </div>

      <UPlotChart options={opts} data={uplotData} height={120} />
    </Surface>
  );
};

export default BurnRateChart;
