import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import TracesPage from './index';
import { useTracesExplorer } from '../../hooks/useTracesExplorer';

vi.mock('@/features/explorer-core/hooks/useLiveTailStream', () => ({
  useLiveTailStream: vi.fn(() => ({
    items: [],
    status: 'idle',
    lagMs: 0,
  })),
}));

vi.mock('@shared/api/tracesService', () => ({
  tracesService: {},
}));

vi.mock('../../hooks/useTracesExplorer', () => ({
  useTracesExplorer: vi.fn(() => ({
    isLoading: false,
    traces: [
      {
        span_id: 'span-1',
        trace_id: 'trace-1',
        service_name: 'checkout-service',
        operation_name: 'POST /orders',
        start_time: '2026-03-20T12:00:00Z',
        end_time: '2026-03-20T12:00:01Z',
        duration_ms: 180,
        status: 'ERROR',
        span_kind: 'server',
        http_method: 'POST',
        http_status_code: 500,
        status_message: '',
        parent_span_id: '',
      },
    ],
    totalTraces: 1,
    errorTraces: 1,
    facets: {
      service_name: [{ value: 'checkout-service', count: 1 }],
      status: [{ value: 'ERROR', count: 1 }],
      operation_name: [{ value: 'POST /orders', count: 1 }],
    },
    searchText: '',
    selectedService: null,
    errorsOnly: false,
    mode: 'all',
    page: 1,
    pageSize: 20,
    filters: [],
    backendParams: {},
    setSearchText: vi.fn(),
    setSelectedService: vi.fn(),
    setErrorsOnly: vi.fn(),
    setMode: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    setFilters: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

vi.mock('../../hooks/useTraceDetailFields', () => ({
  useTraceDetailFields: vi.fn(() => []),
}));

describe('TracesPage', () => {
  it('renders an explorer-only layout without saved views or analytics charts', () => {
    render(
      <MemoryRouter initialEntries={['/traces']}>
        <TracesPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Traces' })).toBeInTheDocument();
    expect(screen.getByText('Trace Explorer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start live tail/i })).toBeInTheDocument();
    expect(screen.queryByText('AI Observability')).not.toBeInTheDocument();
    expect(screen.queryByText('Runs Explorer')).not.toBeInTheDocument();
    expect(screen.queryByText('Trace Throughput')).not.toBeInTheDocument();
    expect(screen.queryByText('P95 Latency')).not.toBeInTheDocument();
    expect(screen.queryByText(/saved views/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search traces, operations, services, or IDs').closest('div')).toHaveClass(
      'rounded-[14px]',
      'min-h-[48px]',
      'bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]',
    );
  });

  it('shows a normalized inline error banner when explorer decoding fails', () => {
    vi.mocked(useTracesExplorer).mockReturnValueOnce({
      isLoading: false,
      isError: true,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Invalid traces explorer response',
      } as any,
      traces: [],
      total: 0,
      totalTraces: 0,
      summary: {
        total_traces: 0,
        error_traces: 0,
        avg_duration: 0,
        p50_duration: 0,
        p95_duration: 0,
        p99_duration: 0,
      },
      errorTraces: 0,
      errorRate: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      trendBuckets: [],
      facets: {
        service_name: [],
        status: [],
        operation_name: [],
      },
      maxDuration: 1,
      searchText: '',
      selectedService: null,
      errorsOnly: false,
      mode: 'all',
      page: 1,
      pageSize: 20,
      filters: [],
      startTime: 1,
      endTime: 2,
      backendParams: {},
      setSearchText: vi.fn(),
      setSelectedService: vi.fn(),
      setErrorsOnly: vi.fn(),
      setMode: vi.fn(),
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      setFilters: vi.fn(),
      clearAll: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/traces']}>
        <TracesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    expect(screen.getByText('Invalid traces explorer response')).toBeInTheDocument();
  });
});
