import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: [
      { service: 'checkout', value: 12 },
      { service: 'orders', value: 8 },
    ],
  }),
}));

import { PieRenderer } from './PieRenderer';

describe('PieRenderer', () => {
  it('renders an svg donut with legend rows instead of an ECharts wrapper', () => {
    render(
      <PieRenderer
        chartConfig={{
          id: 'service-share',
          panelType: 'pie',
          title: 'Service Share',
          order: 1,
          labelKey: 'service',
          valueKey: 'value',
        } as any}
        dataSources={{}}
      />,
    );

    expect(screen.getByRole('img', { name: 'Service Share' })).toBeInTheDocument();
    expect(screen.getByText('checkout')).toBeInTheDocument();
    expect(screen.getByText('orders')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
