import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/hooks/useComponentDataFetcher', () => ({
  useComponentDataFetcher: () => ({
    data: {},
    isLoading: false,
    errors: {},
    hasError: false,
    failedRequests: [],
  }),
}));

vi.mock('./ConfigurableDashboard', () => ({
  default: () => <div data-testid="configurable-dashboard" />,
}));

import DashboardTabContent from './DashboardTabContent';

describe('DashboardTabContent', () => {
  it('renders a scoped empty state when a tab has no panels', () => {
    render(
      <DashboardTabContent
        tab={{
          id: 'overview',
          pageId: 'overview',
          label: 'Overview',
          order: 10,
          sections: [],
          panels: [],
        }}
      />,
    );

    expect(screen.getByText('No dashboard panels')).toBeInTheDocument();
    expect(screen.queryByTestId('configurable-dashboard')).not.toBeInTheDocument();
  });
});
