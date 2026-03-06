import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDashboardConfig } from './useDashboardConfig';

import { dashboardConfigService } from '@services/dashboardConfigService';
import { useAppStore } from '@store/appStore';

vi.mock('@services/dashboardConfigService', () => ({
  dashboardConfigService: {
    getDashboardConfig: vi.fn(),
  },
}));

describe('useDashboardConfig', () => {
  const mockedGetDashboardConfig = vi.mocked(dashboardConfigService.getDashboardConfig);

  function createWrapper() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    return Wrapper;
  }

  beforeEach(() => {
    useAppStore.setState({ selectedTeamId: 7 });
    mockedGetDashboardConfig.mockReset();
  });

  it('normalizes YAML charts into backend-driven components', async () => {
    mockedGetDashboardConfig.mockResolvedValue({
      pageId: 'overview',
      configYaml: `page: overview
charts:
  - id: request-card
    type: request
    title: Request volume
  - id: latency-card
    type: latency
    title: Latency`,
    });

    const { result } = renderHook(() => useDashboardConfig('overview'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.config?.components).toHaveLength(2);
    expect(result.current.config?.components[0]).toMatchObject({
      id: 'request-card',
      componentKey: 'request',
    });
    expect(result.current.config?.components[1]).toMatchObject({
      id: 'latency-card',
      componentKey: 'latency',
    });
  });

  it('accepts direct backend components payload and map shape', async () => {
    mockedGetDashboardConfig.mockResolvedValue({
      pageId: 'metrics',
      components: {
        latency: { type: 'latency', title: 'Latency' },
        requests: { componentKey: 'request', title: 'Requests' },
      },
    });

    const { result } = renderHook(() => useDashboardConfig('metrics'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const components = result.current.config?.components ?? [];
    expect(components).toHaveLength(2);
    expect(components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'latency', componentKey: 'latency' }),
        expect.objectContaining({ id: 'requests', componentKey: 'request' }),
      ]),
    );
  });

  it('returns empty components when YAML is invalid', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetDashboardConfig.mockResolvedValue({
      pageId: 'overview',
      configYaml: 'invalid: [',
    });

    const { result } = renderHook(() => useDashboardConfig('overview'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config?.components ?? []).toHaveLength(0);
    expect(errorSpy).toHaveBeenCalled();
  });
});
