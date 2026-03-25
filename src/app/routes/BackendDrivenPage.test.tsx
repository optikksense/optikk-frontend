import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePagesConfig = vi.fn();
const mockResolveDashboardPageAdapter = vi.fn();

vi.mock('@shared/hooks/usePagesConfig', () => ({
  usePagesConfig: () => mockUsePagesConfig(),
}));

vi.mock('@/app/registry/domainRegistry', () => ({
  resolveDashboardPageAdapter: (...args: unknown[]) => mockResolveDashboardPageAdapter(...args),
}));

vi.mock('@shared/components/ui/dashboard/utils/dashboardUtils', () => ({
  getDashboardIcon: () => <div data-testid="dashboard-icon" />,
}));

vi.mock('@shared/components/ui', () => ({
  DashboardPage: ({ pageId, pathParams }: { pageId: string; pathParams?: Record<string, string> }) => (
    <div data-testid="dashboard-page">
      {pageId}
      {pathParams ? `::${JSON.stringify(pathParams)}` : ''}
    </div>
  ),
  PageShell: ({ children }: { children: ReactNode }) => <div data-testid="page-shell">{children}</div>,
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {subtitle ? <span>{subtitle}</span> : null}
    </div>
  ),
}));

import BackendDrivenPage from './BackendDrivenPage';

describe('BackendDrivenPage', () => {
  beforeEach(() => {
    mockUsePagesConfig.mockReset();
    mockResolveDashboardPageAdapter.mockReset();
  });

  it('renders a registered dashboard page adapter by pageId', () => {
    const Adapter = () => <div data-testid="services-adapter">services adapter</div>;
    mockUsePagesConfig.mockReturnValue({
      pages: [
        {
          schemaVersion: 1,
          id: 'services',
          path: '/services',
          label: 'Services',
          icon: 'Server',
          group: 'observe',
          order: 50,
          defaultTabId: 'overview',
          navigable: true,
          renderMode: 'dashboard',
          title: 'Services',
          subtitle: 'Service health',
        },
      ],
      isLoading: false,
      error: null,
    });
    mockResolveDashboardPageAdapter.mockReturnValue({
      pageId: 'services',
      page: Adapter,
    });

    render(
      <MemoryRouter initialEntries={['/services']}>
        <Routes>
          <Route path="*" element={<BackendDrivenPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('services-adapter')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('matches parameterized backend dashboard pages and forwards path params', () => {
    mockUsePagesConfig.mockReturnValue({
      pages: [
        {
          schemaVersion: 1,
          id: 'operation-detail',
          path: '/services/:serviceName/operations/:operationName',
          label: 'Operation Detail',
          icon: 'Activity',
          group: 'observe',
          order: 60,
          defaultTabId: 'overview',
          navigable: false,
          renderMode: 'dashboard',
          title: 'Operation Detail',
          subtitle: 'Operation health',
        },
      ],
      isLoading: false,
      error: null,
    });
    mockResolveDashboardPageAdapter.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={['/services/checkout/operations/PlaceOrder']}>
        <Routes>
          <Route path="*" element={<BackendDrivenPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('page-header')).toHaveTextContent('Operation Detail');
    expect(screen.getByTestId('dashboard-page')).toHaveTextContent(
      'operation-detail::{"serviceName":"checkout","operationName":"PlaceOrder"}',
    );
  });
});
