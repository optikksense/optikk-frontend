import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DashboardPanelSpec, DashboardTabDocument } from '@/types/dashboardConfig';

vi.mock('./ConfigurableChartCard', () => ({
  default: ({ componentConfig }: { componentConfig: DashboardPanelSpec }) => (
    <div data-testid="dashboard-component">{componentConfig.id}</div>
  ),
}));

vi.mock('@store/appStore', () => ({
  useAppStore: () => ({ selectedTeamId: 7 }),
}));

import ConfigurableDashboard from './ConfigurableDashboard';

describe('ConfigurableDashboard', () => {
  it('renders only panels returned by the backend tab document', () => {
    const config: DashboardTabDocument = {
      id: 'overview',
      pageId: 'overview',
      label: 'Overview',
      order: 10,
      sections: [
        {
          id: 'trends',
          title: 'Golden Signals',
          order: 10,
          kind: 'trends',
          layoutMode: 'two-up',
          collapsible: true,
        },
      ],
      panels: [
        {
          id: 'requests',
          panelType: 'request',
          sectionId: 'trends',
          title: 'Requests',
          order: 10,
          layout: { preset: 'trend' },
          query: { method: 'GET', endpoint: '/v1/requests' },
        },
        {
          id: 'latency',
          panelType: 'latency',
          sectionId: 'trends',
          title: 'Latency',
          order: 20,
          layout: { preset: 'trend' },
          query: { method: 'GET', endpoint: '/v1/latency' },
        },
      ],
    };

    render(<ConfigurableDashboard config={config} dataSources={{}} />);

    const rendered = screen.getAllByTestId('dashboard-component');
    expect(rendered).toHaveLength(2);
    expect(screen.getByText('requests')).toBeInTheDocument();
    expect(screen.getByText('latency')).toBeInTheDocument();
    expect(screen.queryByText('error-rate')).not.toBeInTheDocument();
  });

  it('does not render frontend fallback panels when the backend list is empty', () => {
    const config: DashboardTabDocument = {
      id: 'overview',
      pageId: 'overview',
      label: 'Overview',
      order: 10,
      sections: [],
      panels: [],
    };

    render(<ConfigurableDashboard config={config} dataSources={{}} />);

    expect(screen.queryByTestId('dashboard-component')).not.toBeInTheDocument();
  });

  it('renders kpi-strip sections separately from chart sections', () => {
    const config: DashboardTabDocument = {
      id: 'overview',
      pageId: 'overview',
      label: 'Overview',
      order: 10,
      sections: [
        {
          id: 'summary',
          title: 'Key Metrics',
          order: 10,
          kind: 'summary',
          layoutMode: 'kpi-strip',
          collapsible: true,
        },
        {
          id: 'trends',
          title: 'Golden Signals',
          order: 20,
          kind: 'trends',
          layoutMode: 'two-up',
          collapsible: true,
        },
      ],
      panels: [
        {
          id: 'requests-total',
          panelType: 'stat-card',
          sectionId: 'summary',
          title: 'Requests',
          order: 10,
          layout: { preset: 'kpi' },
          query: { method: 'GET', endpoint: '/v1/requests/total' },
        },
        {
          id: 'request-rate',
          panelType: 'request',
          sectionId: 'trends',
          title: 'Request Rate',
          order: 20,
          layout: { preset: 'trend' },
          query: { method: 'GET', endpoint: '/v1/requests/rate' },
        },
      ],
    };

    render(<ConfigurableDashboard config={config} dataSources={{}} />);

    expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    expect(screen.getByText('Golden Signals')).toBeInTheDocument();
    expect(screen.getByText('requests-total')).toBeInTheDocument();
    expect(screen.getByText('request-rate')).toBeInTheDocument();
  });

  it('removing one panel only affects that section and keeps other sections stable', () => {
    const baseConfig: DashboardTabDocument = {
      id: 'overview',
      pageId: 'overview',
      label: 'Overview',
      order: 10,
      sections: [
        {
          id: 'summary',
          title: 'Key Metrics',
          order: 10,
          kind: 'summary',
          layoutMode: 'kpi-strip',
          collapsible: true,
        },
        {
          id: 'details',
          title: 'Details',
          order: 20,
          kind: 'details',
          layoutMode: 'stack',
          collapsible: true,
        },
      ],
      panels: [
        {
          id: 'kpi-a',
          panelType: 'stat-card',
          sectionId: 'summary',
          title: 'KPI A',
          order: 10,
          layout: { preset: 'kpi' },
          query: { method: 'GET', endpoint: '/v1/kpi-a' },
        },
        {
          id: 'kpi-b',
          panelType: 'stat-card',
          sectionId: 'summary',
          title: 'KPI B',
          order: 20,
          layout: { preset: 'kpi' },
          query: { method: 'GET', endpoint: '/v1/kpi-b' },
        },
        {
          id: 'table-a',
          panelType: 'table',
          sectionId: 'details',
          title: 'Table A',
          order: 30,
          layout: { preset: 'detail' },
          query: { method: 'GET', endpoint: '/v1/table-a' },
        },
      ],
    };

    const { rerender } = render(<ConfigurableDashboard config={baseConfig} dataSources={{}} />);
    expect(screen.getAllByTestId('dashboard-component')).toHaveLength(3);
    expect(screen.getByText('table-a')).toBeInTheDocument();

    rerender(
      <ConfigurableDashboard
        config={{
          ...baseConfig,
          panels: baseConfig.panels.filter((panel) => panel.id !== 'kpi-b'),
        }}
        dataSources={{}}
      />
    );

    expect(screen.getAllByTestId('dashboard-component')).toHaveLength(2);
    expect(screen.queryByText('kpi-b')).not.toBeInTheDocument();
    expect(screen.getByText('table-a')).toBeInTheDocument();
  });
});
