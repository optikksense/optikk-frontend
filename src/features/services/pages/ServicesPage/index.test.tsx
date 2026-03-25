import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/components/ui', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
  PageShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@shared/components/ui/calm', () => ({
  HealthSnapshotStrip: () => <div data-testid="health-strip" />,
  ServiceFlyInPanel: () => <div data-testid="flyin-panel" />,
}));

vi.mock('@shared/components/ui/dashboard/DashboardPage', () => ({
  default: ({ pageId }: { pageId: string }) => <div data-testid="dashboard-page">{pageId}</div>,
}));

import ServicesPage from './index';

describe('ServicesPage', () => {
  it('uses the backend-driven services dashboard and does not render the removed Topology tab', () => {
    render(<ServicesPage />);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toHaveTextContent('services');
    expect(screen.queryByText('Topology')).not.toBeInTheDocument();
  });
});
