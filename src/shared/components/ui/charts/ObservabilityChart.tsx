import { useMemo } from 'react';
import uPlot from 'uplot';

import { cn } from '@/lib/utils';

import UPlotChart, { defaultAxes, uLine } from './UPlotChart';

export interface ObservabilityChartSeries {
  label: string;
  values: Array<number | null>;
  color: string;
  fill?: boolean;
  dash?: number[];
  width?: number;
}

export interface ObservabilityChartProps {
  timestamps: number[];
  series: ObservabilityChartSeries[];
  height?: number;
  fillHeight?: boolean;
  yMin?: number;
  yMax?: number;
  yAxisSize?: number;
  yFormatter?: (value: number) => string;
  legend?: boolean;
  className?: string;
}

export default function ObservabilityChart({
  timestamps,
  series,
  height = 280,
  fillHeight = false,
  yMin,
  yMax,
  yAxisSize = 60,
  yFormatter,
  legend = false,
  className,
}: ObservabilityChartProps) {
  const alignedData = useMemo<uPlot.AlignedData>(
    () => [timestamps, ...series.map((item) => item.values)] as uPlot.AlignedData,
    [timestamps, series],
  );

  const options = useMemo<Omit<uPlot.Options, 'width' | 'height'>>(() => {
    const axes = defaultAxes({ yAxisSize });
    axes[1] = {
      ...axes[1],
      values: yFormatter
        ? (_u: uPlot, vals: number[]) => vals.map((value) => yFormatter(value))
        : axes[1].values,
    };

    return {
      padding: [10, 12, 4, 0],
      legend: { show: legend },
      axes,
      scales: {
        y: {
          ...(yMin != null ? { min: yMin } : {}),
          ...(yMax != null ? { max: yMax } : {}),
        },
      },
      series: [
        {},
        ...series.map((item) => (
          uLine(item.label, item.color, {
            fill: item.fill,
            dash: item.dash,
            width: item.width ?? 1.85,
          })
        )),
      ],
    };
  }, [legend, series, yAxisSize, yFormatter, yMin, yMax]);

  return (
    <div className={cn('h-full min-h-0', className)}>
      <UPlotChart
        options={options}
        data={alignedData}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
}
