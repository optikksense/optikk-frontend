import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockObservabilityChart } = vi.hoisted(() => ({
  mockObservabilityChart: vi.fn(),
}));

vi.mock('@shared/hooks/useChartTimeBuckets', () => ({
  useChartTimeBuckets: () => ({
    timeBuckets: [
      '2026-03-20T20:20:00Z',
      '2026-03-20T20:21:00Z',
    ],
  }),
}));

vi.mock('../ObservabilityChart', () => ({
  default: (props: {
    height?: number;
    fillHeight?: boolean;
    yMin?: number;
    yMax?: number;
    yFormatter?: (value: number) => string;
  }) => {
    mockObservabilityChart(props);
    return (
      <div
        data-testid="observability-chart"
        data-height={String(props.height ?? '')}
        data-fill-height={String(Boolean(props.fillHeight))}
      />
    );
  },
}));

import ErrorRateChart from './ErrorRateChart';
import ExceptionTypeLineChart from './ExceptionTypeLineChart';
import LatencyChart from './LatencyChart';
import RequestChart from './RequestChart';

describe('Generic dashboard observability charts', () => {
  afterEach(() => {
    mockObservabilityChart.mockClear();
  });

  it('RequestChart forwards dashboard sizing into the shared chart wrapper', () => {
    render(
      <RequestChart
        data={[{ timestamp: '2026-03-20T20:20:00Z', request_count: 2 }]}
        height={220}
        fillHeight
      />,
    );

    const props = mockObservabilityChart.mock.calls.at(-1)?.[0];
    expect(props.height).toBe(220);
    expect(props.fillHeight).toBe(true);
    expect(props.yMin).toBe(0);
  });

  it('ErrorRateChart forwards percent bounds into the shared chart wrapper', () => {
    render(
      <ErrorRateChart
        data={[{ timestamp: '2026-03-20T20:20:00Z', value: 1.5 }]}
        height={220}
      />,
    );

    const props = mockObservabilityChart.mock.calls.at(-1)?.[0];
    expect(props.height).toBe(220);
    expect(props.yMin).toBe(0);
    expect(props.yFormatter(2.5)).toBe('2.5%');
  });

  it('LatencyChart forwards the latency formatter into the shared chart wrapper', () => {
    render(
      <LatencyChart
        data={[{ timestamp: '2026-03-20T20:20:00Z', value: 14 }]}
        height={220}
      />,
    );

    const props = mockObservabilityChart.mock.calls.at(-1)?.[0];
    expect(props.height).toBe(220);
    expect(props.yFormatter(14)).toBe('14ms');
  });

  it('ExceptionTypeLineChart forwards dashboard sizing into the shared chart wrapper', () => {
    render(
      <ExceptionTypeLineChart
        serviceTimeseriesMap={{
          TimeoutError: [{ timestamp: '2026-03-20T20:20:00Z', count: 1 }],
        }}
        height={220}
        fillHeight
      />,
    );

    const props = mockObservabilityChart.mock.calls.at(-1)?.[0];
    expect(props.height).toBe(220);
    expect(props.fillHeight).toBe(true);
    expect(props.yMin).toBe(0);
  });
});
