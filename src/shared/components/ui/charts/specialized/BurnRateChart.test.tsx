import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockUPlotChart } = vi.hoisted(() => ({
  mockUPlotChart: vi.fn(),
}));

vi.mock('../UPlotChart', () => ({
  default: (props: Record<string, unknown>) => {
    mockUPlotChart(props);
    return <div data-testid="uplot-chart" />;
  },
  defaultAxes: () => [{}, { size: 60 }],
  uLine: (label: string, stroke: string, opts?: Record<string, unknown>) => ({
    label,
    stroke,
    ...opts,
  }),
}));

import BurnRateChart from './BurnRateChart';

describe('BurnRateChart', () => {
  afterEach(() => {
    mockUPlotChart.mockClear();
    document.documentElement.removeAttribute('style');
  });

  it('resolves series colors before passing them into uPlot', () => {
    document.documentElement.style.setProperty('--chart-1', '#8b7fff');
    document.documentElement.style.setProperty('--chart-2', '#f38b6b');
    document.documentElement.style.setProperty('--severity-critical', '#f04438');
    document.documentElement.style.setProperty('--severity-high', '#f79009');
    document.documentElement.style.setProperty('--severity-low', '#8b7fff');

    render(
      <BurnRateChart
        data={[
          { ts: '12:00', burnRate1h: 1.2, burnRate6h: 0.9 },
          { ts: '12:05', burnRate1h: 2.4, burnRate6h: 1.4 },
        ]}
      />,
    );

    const props = mockUPlotChart.mock.calls.at(-1)?.[0] as {
      options: { series: Array<Record<string, unknown>> };
    };

    expect(props.options.series[1]).toMatchObject({ stroke: '#8b7fff' });
    expect(props.options.series[2]).toMatchObject({ stroke: '#f38b6b' });
    expect(JSON.stringify(props.options.series)).not.toContain('var(');
  });
});
