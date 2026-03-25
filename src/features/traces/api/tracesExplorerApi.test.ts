import { describe, expect, it, vi } from 'vitest';

import { tracesExplorerApi } from './tracesExplorerApi';

vi.mock('@/shared/api/api/client', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '@/shared/api/api/client';

describe('tracesExplorerApi', () => {
  it('accepts stringified explorer payloads and normalizes them before schema parsing', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(JSON.stringify({
      results: [
        {
          span_id: 'span-1',
          trace_id: 'trace-1',
          service_name: 'checkout-service',
          operation_name: 'POST /orders',
          start_time: '2026-03-23T08:00:00Z',
          end_time: '2026-03-23T08:00:00.12Z',
          duration_ms: 120,
          status: 'OK',
          span_kind: 'SERVER',
        },
      ],
      summary: {
        total_traces: 1,
        error_traces: 0,
        avg_duration: 120,
        p50_duration: 120,
        p95_duration: 120,
        p99_duration: 120,
      },
      facets: {
        service_name: [
          { value: 'checkout-service', count: 1 },
        ],
      },
      trend: [],
      pageInfo: {
        total: 1,
        hasMore: false,
        offset: 0,
        limit: 50,
      },
    }));

    await expect(
      tracesExplorerApi.query({
        startTime: 1,
        endTime: 2,
        limit: 50,
        offset: 0,
        step: '5m',
        params: {},
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        results: [
          expect.objectContaining({
            trace_id: 'trace-1',
            service_name: 'checkout-service',
          }),
        ],
        summary: expect.objectContaining({
          total_traces: 1,
        }),
        pageInfo: expect.objectContaining({
          total: 1,
        }),
      }),
    );
  });

  it('unwraps stringified success envelopes before schema parsing', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(JSON.stringify({
      success: true,
      data: {
        results: [],
        summary: {
          total_traces: 0,
          error_traces: 0,
          avg_duration: 0,
          p50_duration: 0,
          p95_duration: 0,
          p99_duration: 0,
        },
        facets: {},
        trend: [],
        pageInfo: {
          total: 0,
          hasMore: false,
          offset: 0,
          limit: 50,
        },
      },
    }));

    await expect(
      tracesExplorerApi.query({
        startTime: 1,
        endTime: 2,
        limit: 50,
        offset: 0,
        step: '5m',
        params: {},
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        results: [],
        summary: expect.objectContaining({ total_traces: 0 }),
        pageInfo: expect.objectContaining({ total: 0 }),
      }),
    );
  });

  it('throws a normalized contract error when the payload is still malformed', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.post).mockResolvedValueOnce('not-json');

    await expect(
      tracesExplorerApi.query({
        startTime: 1,
        endTime: 2,
        limit: 50,
        offset: 0,
        step: '5m',
        params: {},
      }),
    ).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: 'Invalid traces explorer response',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[decodeApiResponse] Invalid traces explorer response',
      expect.objectContaining({
        context: 'traces explorer',
        payloadType: 'string',
        preview: 'not-json',
      }),
    );

    consoleErrorSpy.mockRestore();
  });

  it('throws a normalized contract error for html payloads', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.post).mockResolvedValueOnce('<!DOCTYPE html><html><body>auth</body></html>');

    await expect(
      tracesExplorerApi.query({
        startTime: 1,
        endTime: 2,
        limit: 50,
        offset: 0,
        step: '5m',
        params: {},
      }),
    ).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: 'Invalid traces explorer response',
    });

    consoleErrorSpy.mockRestore();
  });
});
