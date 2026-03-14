import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTracesExplorer } from './useTracesExplorer';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@shared/hooks/useURLFilters', () => ({
  useURLFilters: vi.fn(() => ({
    values: { search: '', service: '', errorsOnly: false },
    setters: {
      search: vi.fn(),
      service: vi.fn(),
      errorsOnly: vi.fn(),
    },
    structuredFilters: [],
    setStructuredFilters: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

vi.mock('@shared/store/appStore', () => ({
  useAppStore: vi.fn(() => ({
    selectedTeamId: 1,
    timeRange: { value: 'relative', minutes: 60 },
    refreshKey: 0,
  })),
}));

vi.mock('../api/queryOptions', () => ({
  traceQueries: {
    list: vi.fn(() => ({
      queryKey: ['traces'],
      queryFn: vi.fn(),
      enabled: true,
      staleTime: 30000,
    })),
  },
}));

import { useQuery } from '@tanstack/react-query';

describe('useTracesExplorer', () => {
  it('derives KPIs and service breakdown inputs from normalized traces data', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        traces: [
          {
            span_id: 'span-1',
            trace_id: 'trace-1',
            service_name: 'checkout-service',
            operation_name: 'POST /orders',
            start_time: '2026-03-14T18:56:54Z',
            end_time: '2026-03-14T18:56:54.18Z',
            duration_ms: 180,
            status: 'OK',
            span_kind: '',
            http_method: 'POST',
            http_status_code: 201,
          },
          {
            span_id: 'span-2',
            trace_id: 'trace-2',
            service_name: 'inventory-service',
            operation_name: 'GET /stock',
            start_time: '2026-03-14T18:57:00Z',
            end_time: '2026-03-14T18:57:00.12Z',
            duration_ms: 120,
            status: 'ERROR',
            span_kind: '',
            http_method: 'GET',
            http_status_code: 500,
          },
        ],
        total: 2,
        summary: {
          errorTraces: 1,
          p95Duration: 180,
          p99Duration: 180,
        },
      },
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useTracesExplorer());

    expect(result.current.totalTraces).toBe(2);
    expect(result.current.errorRate).toBe(50);
    expect(result.current.p95).toBe(180);
    expect(result.current.p99).toBe(180);
    expect(result.current.maxDuration).toBe(180);
    expect(result.current.serviceBadges).toEqual([
      ['checkout-service', 1],
      ['inventory-service', 1],
    ]);
    expect(result.current.traces).toHaveLength(2);
  });
});
