import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  mockUsePageTabs,
  mockUseDashboardTabDocument,
  mockUseUrlSyncedTab,
  mockDashboardTabContent,
} = vi.hoisted(() => ({
  mockUsePageTabs: vi.fn(),
  mockUseDashboardTabDocument: vi.fn(),
  mockUseUrlSyncedTab: vi.fn(),
  mockDashboardTabContent: vi.fn(),
}));

vi.mock('@/components/ui', () => ({
  Tabs: ({ activeKey }: { activeKey: string }) => <div data-testid="tabs">{activeKey}</div>,
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock('@shared/hooks/usePageTabs', () => ({
  usePageTabs: (...args: unknown[]) => mockUsePageTabs(...args),
}));

vi.mock('@shared/hooks/useDashboardTabDocument', () => ({
  useDashboardTabDocument: (...args: unknown[]) => mockUseDashboardTabDocument(...args),
}));

vi.mock('@shared/hooks/useUrlSyncedTab', () => ({
  useUrlSyncedTab: (...args: unknown[]) => mockUseUrlSyncedTab(...args),
}));

vi.mock('./DashboardTabContent', () => ({
  default: (props: Record<string, unknown>) => {
    mockDashboardTabContent(props);
    return <div data-testid="dashboard-tab-content" />;
  },
}));

import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockUsePageTabs.mockReset();
    mockUseDashboardTabDocument.mockReset();
    mockUseUrlSyncedTab.mockReset();
    mockDashboardTabContent.mockReset();
  });

  it('renders a scoped error state when tabs fail to load', () => {
    mockUsePageTabs.mockReturnValue({
      tabs: [],
      isLoading: false,
      error: new Error('tabs failed'),
    });
    mockUseUrlSyncedTab.mockReturnValue({
      activeTab: '',
      onTabChange: vi.fn(),
    });
    mockUseDashboardTabDocument.mockReturnValue({
      tab: null,
      isLoading: false,
      error: null,
    });

    render(<DashboardPage pageId="overview" />);

    expect(screen.getByText('Dashboard unavailable')).toBeInTheDocument();
    expect(screen.getByText('tabs failed')).toBeInTheDocument();
  });

  it('renders a scoped empty state when no tabs are configured', () => {
    mockUsePageTabs.mockReturnValue({
      tabs: [],
      isLoading: false,
      error: null,
    });
    mockUseUrlSyncedTab.mockReturnValue({
      activeTab: '',
      onTabChange: vi.fn(),
    });
    mockUseDashboardTabDocument.mockReturnValue({
      tab: null,
      isLoading: false,
      error: null,
    });

    render(<DashboardPage pageId="overview" />);

    expect(screen.getByText('No dashboard tabs available')).toBeInTheDocument();
  });

  it('renders a scoped error state when the selected tab components fail to load', () => {
    mockUsePageTabs.mockReturnValue({
      tabs: [{ id: 'tab-1', pageId: 'overview', label: 'Overview', order: 10 }],
      isLoading: false,
      error: null,
    });
    mockUseUrlSyncedTab.mockReturnValue({
      activeTab: 'tab-1',
      onTabChange: vi.fn(),
    });
    mockUseDashboardTabDocument.mockReturnValue({
      tab: null,
      isLoading: false,
      error: new Error('components failed'),
    });

    render(<DashboardPage pageId="overview" />);

    expect(screen.getByText('Dashboard tab unavailable')).toBeInTheDocument();
    expect(screen.getByText('components failed')).toBeInTheDocument();
  });

  it('falls back to the default tab when the synced tab is invalid', () => {
    mockUsePageTabs.mockReturnValue({
      tabs: [{ id: 'tab-1', pageId: 'overview', label: 'Overview', order: 10 }],
      isLoading: false,
      error: null,
    });
    mockUseUrlSyncedTab.mockReturnValue({
      activeTab: 'invalid-tab',
      onTabChange: vi.fn(),
    });
    mockUseDashboardTabDocument.mockReturnValue({
      tab: {
        id: 'tab-1',
        pageId: 'overview',
        label: 'Overview',
        order: 1,
        sections: [
          { id: 'golden-signals', title: 'Golden Signals', order: 10, kind: 'trends', layoutMode: 'two-up', collapsible: true },
        ],
        panels: [{ id: 'requests', panelType: 'request', sectionId: 'golden-signals', title: 'Requests', order: 1, layout: { preset: 'trend' } }],
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardPage pageId="overview" />);

    expect(mockUseDashboardTabDocument).toHaveBeenCalledWith('overview', 'tab-1');
    expect(screen.getByTestId('dashboard-tab-content')).toBeInTheDocument();
  });
});
