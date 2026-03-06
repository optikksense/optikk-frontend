import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { DashboardComponentSpec, DashboardRenderConfig } from '@/types/dashboardConfig';

import ConfigurableDashboard from './ConfigurableDashboard';

vi.mock('antd', () => ({
  Col: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Spin: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@components/ui/dashboard', () => ({
  ConfigurableChartCard: ({ componentConfig }: { componentConfig: DashboardComponentSpec }) => (
    <div data-testid="dashboard-component">{componentConfig.componentKey}</div>
  ),
}));

describe('ConfigurableDashboard', () => {
  it('renders only components returned by backend config', () => {
    const config: DashboardRenderConfig = {
      components: [
        { id: 'requests', componentKey: 'request', title: 'Requests' },
        { id: 'latency', componentKey: 'latency', title: 'Latency' },
      ],
    };

    render(
      <ConfigurableDashboard
        config={config}
        dataSources={{}}
      />,
    );

    const rendered = screen.getAllByTestId('dashboard-component');
    expect(rendered).toHaveLength(2);
    expect(screen.getByText('request')).toBeInTheDocument();
    expect(screen.getByText('latency')).toBeInTheDocument();
    expect(screen.queryByText('error-rate')).not.toBeInTheDocument();
  });

  it('does not render frontend fallback components when backend list is empty', () => {
    const config: DashboardRenderConfig = {
      components: [],
    };

    render(
      <ConfigurableDashboard
        config={config}
        dataSources={{}}
      />,
    );

    expect(screen.queryByTestId('dashboard-component')).not.toBeInTheDocument();
  });
});
