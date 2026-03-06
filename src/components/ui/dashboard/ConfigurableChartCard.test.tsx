import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';

import ConfigurableChartCard from './ConfigurableChartCard';

describe('ConfigurableChartCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles unknown backend component keys gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'unknown-key-card',
      componentKey: 'does-not-exist',
      title: 'Unknown',
    };

    render(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{}}
        extraContext={{}}
      />,
    );

    expect(screen.getByText(/Unknown dashboard component key:/)).toBeInTheDocument();
    expect(screen.getByText(/does-not-exist/)).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown dashboard component key received from backend: does-not-exist',
    );
  });
});
