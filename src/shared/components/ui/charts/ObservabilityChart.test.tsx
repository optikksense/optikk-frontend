import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockUPlotChart } = vi.hoisted(() => ({
  mockUPlotChart: vi.fn(),
}));

vi.mock('./UPlotChart', () => ({
  default: (props: Record<string, unknown>) => {
    mockUPlotChart(props);
    return <div data-testid="uplot-chart" />;
  },
  defaultAxes: ({ yAxisSize }: { yAxisSize?: number }) => [
    { size: 0, stroke: 'x' },
    { size: yAxisSize ?? 60, stroke: 'y' },
  ],
  uLine: (label: string, color: string, opts?: Record<string, unknown>) => ({
    label,
    color,
    ...opts,
  }),
}));

import ObservabilityChart from './ObservabilityChart';

describe('ObservabilityChart', () => {
  afterEach(() => {
    mockUPlotChart.mockClear();
  });

  it('applies the shared defaults for layout, legend, and line weight', () => {
    render(
      <ObservabilityChart
        timestamps={[1, 2]}
        series={[{ label: 'requests', color: '#7C7FF2', values: [10, 20] }]}
      />,
    );

    const props = mockUPlotChart.mock.calls.at(-1)?.[0] as {
      height: number;
      options: {
        padding: number[];
        legend: { show: boolean };
        axes: Array<{ size?: number }>;
        series: Array<Record<string, unknown>>;
      };
    };

    expect(props.height).toBe(280);
    expect(props.options.padding).toEqual([10, 12, 4, 0]);
    expect(props.options.legend).toEqual({ show: false });
    expect(props.options.axes[1]).toMatchObject({ size: 60 });
    expect(props.options.series[1]).toMatchObject({ label: 'requests', width: 1.85 });
  });
});
