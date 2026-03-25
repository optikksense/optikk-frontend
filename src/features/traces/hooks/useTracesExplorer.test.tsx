import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTracesExplorer } from './useTracesExplorer';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@shared/hooks/useURLFilters', () => ({
  useURLFilters: vi.fn(() => ({
    values: { search: '', service: '', errorsOnly: false, mode: 'all' },
    setters: {
      search: vi.fn(),
      service: vi.fn(),
      errorsOnly: vi.fn(),
      mode: vi.fn(),
    },
    structuredFilters: [],
    setStructuredFilters: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

vi.mock('@app/store/appStore', () => ({
  useAppStore: vi.fn(() => ({
    selectedTeamId: 1,
    timeRange: { value: 'relative', minutes: 60 },
    refreshKey: 0,
  })),
}));

describe('useTracesExplorer', () => {
  it('derives KPIs and service breakdown inputs from normalized traces data', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        results: [
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
        summary: {
          total_traces: 2,
          error_traces: 1,
          p50_duration: 120,
          p95_duration: 180,
          p99_duration: 180,
        },
        facets: {
          service_name: [
            { value: 'checkout-service', count: 1 },
            { value: 'inventory-service', count: 1 },
          ],
        },
        trend: [],
        pageInfo: {
          total: 2,
          hasMore: false,
          offset: 0,
          limit: 20,
        },
      },
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useTracesExplorer());

    expect(result.current.mode).toBe('all');
    expect(result.current.totalTraces).toBe(2);
    expect(result.current.errorRate).toBe(50);
    expect(result.current.p50).toBe(120);
    expect(result.current.p95).toBe(180);
    expect(result.current.p99).toBe(180);
    expect(result.current.maxDuration).toBe(180);
    expect(result.current.traces).toHaveLength(2);
  });
});
