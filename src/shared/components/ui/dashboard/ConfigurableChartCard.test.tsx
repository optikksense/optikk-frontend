import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';
import { BUILT_IN_DASHBOARD_PANELS } from '@shared/components/ui/dashboard/builtInDashboardPanels';
import { DashboardPanelRegistryProvider } from '@shared/components/ui/dashboard/dashboardPanelRegistry';

const { requestChartShouldThrow } = vi.hoisted(() => ({
  requestChartShouldThrow: { current: false },
}));

vi.mock('@shared/components/ui/charts/time-series/RequestChart', () => ({
  default: ({
    data,
    height,
    fillHeight,
  }: {
    data?: Array<Record<string, unknown>>;
    height?: number;
    fillHeight?: boolean;
  }) => {
    if (requestChartShouldThrow.current) {
      throw new Error('Request chart exploded');
    }

    return (
      <div
        data-testid="request-chart"
        data-height={String(height ?? '')}
        data-fill-height={String(Boolean(fillHeight))}
      >
        {Array.isArray(data) ? data.length : 0}
      </div>
    );
  },
}));

import ConfigurableChartCard from './ConfigurableChartCard';

function renderWithDashboardPanels(element: JSX.Element) {
  return render(
    <DashboardPanelRegistryProvider registrations={BUILT_IN_DASHBOARD_PANELS}>
      {element}
    </DashboardPanelRegistryProvider>,
  );
}

function collectConsoleMessages(spy: ReturnType<typeof vi.spyOn>) {
  return spy.mock.calls
    .flat()
    .map((value) => String(value))
    .join('\n');
}

describe('ConfigurableChartCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    requestChartShouldThrow.current = false;
  });

  it('handles unknown backend component keys gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'unknown-key-card',
      panelType: 'does-not-exist',
      title: 'Unknown',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/unknown' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{}}
        extraContext={{}}
      />,
    );

    expect(screen.getByText(/Unknown dashboard panel type:/)).toBeInTheDocument();
    expect(screen.getByText(/does-not-exist/)).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown dashboard panel type received from backend: does-not-exist',
    );
  });

  it('renders stat-card through the shared renderer registry', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'total-requests',
      panelType: 'stat-card',
      title: 'Total Requests',
      order: 10,
      valueField: 'request_count',
      query: { method: 'GET', endpoint: '/v1/overview/total-requests' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'total-requests': { request_count: 1234 },
        }}
        extraContext={{}}
      />,
    );

    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.queryByText(/Unknown dashboard panel type:/)).not.toBeInTheDocument();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('renders stat-summary panels with a visible card title', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'latency-summary',
      panelType: 'stat-summary',
      title: 'JVM Key Metrics',
      order: 10,
      formatter: 'number',
      summaryFields: [
        { label: 'Max Heap', field: 'max_heap' },
        { label: 'Threads', field: 'thread_count' },
        { label: 'Classes', field: 'class_count' },
        { label: 'GC Runs', field: 'gc_runs' },
      ],
      query: { method: 'GET', endpoint: '/v1/overview/latency-summary' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'latency-summary': {
            max_heap: 10,
            thread_count: 20,
            class_count: 30,
            gc_runs: 40,
          },
        }}
        extraContext={{}}
      />,
    );

    expect(screen.getByText('JVM Key Metrics')).toBeInTheDocument();
    expect(screen.getByText('Max Heap')).toBeInTheDocument();
    expect(screen.getByText('Threads')).toBeInTheDocument();
    expect(screen.queryByText(/Unknown dashboard panel type:/)).not.toBeInTheDocument();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('passes rows through when the datasource is already an array', async () => {
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': [
            { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
            { timestamp: '2026-03-20T20:21:00Z', request_count: 2 },
          ],
        }}
        extraContext={{}}
      />,
    );

    expect(await screen.findByTestId('request-chart')).toHaveTextContent('2');
  });

  it('renders the configured title for generic dashboard charts', async () => {
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Service Request Rate',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': [
            { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
          ],
        }}
        extraContext={{}}
      />,
    );

    expect(screen.getByText('Service Request Rate')).toBeInTheDocument();
    expect(await screen.findByTestId('request-chart')).toHaveAttribute('data-fill-height', 'true');
  });

  it('passes nested data rows through when the datasource shape is { data: [...] }', async () => {
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': {
            data: [
              { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
              { timestamp: '2026-03-20T20:21:00Z', request_count: 2 },
              { timestamp: '2026-03-20T20:22:00Z', request_count: 3 },
            ],
          },
        }}
        extraContext={{}}
      />,
    );

    expect(await screen.findByTestId('request-chart')).toHaveTextContent('3');
  });

  it('contains renderer crashes inside the card boundary', () => {
    requestChartShouldThrow.current = true;

    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': [
            { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
          ],
        }}
        extraContext={{}}
      />,
    );

    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.getByText('Request chart exploded')).toBeInTheDocument();
  });

  it('keeps hook order stable when rerendering from data to error and back', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    const { rerender } = renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': [
            { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
          ],
        }}
        extraContext={{}}
      />,
    );

    expect(() => rerender(
      <DashboardPanelRegistryProvider registrations={BUILT_IN_DASHBOARD_PANELS}>
        <ConfigurableChartCard
          componentConfig={componentConfig}
          dataSources={{}}
          error={{ code: 'REQUEST_FAILED', message: 'Request failed' } as any}
          extraContext={{}}
        />
      </DashboardPanelRegistryProvider>,
    )).not.toThrow();
    expect(screen.getByText('Request failed')).toBeInTheDocument();

    expect(() => rerender(
      <DashboardPanelRegistryProvider registrations={BUILT_IN_DASHBOARD_PANELS}>
        <ConfigurableChartCard
          componentConfig={componentConfig}
          dataSources={{
            'request-rate': [
              { timestamp: '2026-03-20T20:21:00Z', request_count: 2 },
            ],
          }}
          extraContext={{}}
        />
      </DashboardPanelRegistryProvider>,
    )).not.toThrow();
    expect(await screen.findByTestId('request-chart')).toBeInTheDocument();
    expect(collectConsoleMessages(consoleErrorSpy)).not.toMatch(/Rendered (fewer|more) hooks than expected/);
  });

  it('keeps hook order stable when rerendering between no-data and data states', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    const { rerender } = renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{}}
        extraContext={{}}
      />,
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();

    expect(() => rerender(
      <DashboardPanelRegistryProvider registrations={BUILT_IN_DASHBOARD_PANELS}>
        <ConfigurableChartCard
          componentConfig={componentConfig}
          dataSources={{
            'request-rate': [
              { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
            ],
          }}
          extraContext={{}}
        />
      </DashboardPanelRegistryProvider>,
    )).not.toThrow();
    expect(await screen.findByTestId('request-chart')).toBeInTheDocument();

    expect(() => rerender(
      <DashboardPanelRegistryProvider registrations={BUILT_IN_DASHBOARD_PANELS}>
        <ConfigurableChartCard
          componentConfig={componentConfig}
          dataSources={{}}
          extraContext={{}}
        />
      </DashboardPanelRegistryProvider>,
    )).not.toThrow();
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(collectConsoleMessages(consoleErrorSpy)).not.toMatch(/Rendered (fewer|more) hooks than expected/);
  });

  it('keeps hook order stable when rerendering from a known renderer to an unknown key', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const knownConfig: DashboardComponentSpec = {
      id: 'request-rate',
      panelType: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };
    const unknownConfig: DashboardComponentSpec = {
      ...knownConfig,
      panelType: 'does-not-exist',
    };

    const { rerender } = renderWithDashboardPanels(
      <ConfigurableChartCard
        componentConfig={knownConfig}
        dataSources={{
          'request-rate': [
            { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
          ],
        }}
        extraContext={{}}
      />,
    );

    expect(() => rerender(
      <DashboardPanelRegistryProvider registrations={BUILT_IN_DASHBOARD_PANELS}>
        <ConfigurableChartCard
          componentConfig={unknownConfig}
          dataSources={{
            'request-rate': [
              { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
            ],
          }}
          extraContext={{}}
        />
      </DashboardPanelRegistryProvider>,
    )).not.toThrow();

    expect(screen.getByText(/Unknown dashboard panel type:/)).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Unknown dashboard panel type received from backend: does-not-exist',
    );
    expect(collectConsoleMessages(consoleErrorSpy)).not.toMatch(/Rendered (fewer|more) hooks than expected/);
  });
});
