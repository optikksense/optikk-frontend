import { describe, expect, it, vi } from 'vitest';

import { tracesApi } from './tracesApi';

vi.mock('@shared/api/tracesService', () => ({
  tracesService: {
    getTraces: vi.fn(),
    getTraceSpans: vi.fn(),
  },
}));

import { tracesService } from '@shared/api/tracesService';

describe('tracesApi', () => {
  it('normalizes camelCase traces payloads before schema parsing', async () => {
    vi.mocked(tracesService.getTraces).mockResolvedValueOnce({
      traces: [
        {
          spanId: 'span-1',
          traceId: 'trace-1',
          serviceName: 'checkout-service',
          operationName: 'POST /orders',
          startTime: '2026-03-14T18:56:54Z',
          endTime: '2026-03-14T18:56:54.18Z',
          durationMs: 180,
          status: 'OK',
          httpMethod: 'POST',
          httpStatusCode: 201,
        },
      ],
      summary: {
        totalTraces: 1,
        errorTraces: 0,
        p95Duration: 180,
        p99Duration: 180,
      },
    });

    await expect(tracesApi.getTraces(1, 1, 2, {})).resolves.toEqual({
      traces: [
        expect.objectContaining({
          span_id: 'span-1',
          trace_id: 'trace-1',
          service_name: 'checkout-service',
          operation_name: 'POST /orders',
          duration_ms: 180,
          http_method: 'POST',
          http_status_code: 201,
          span_kind: '',
        }),
      ],
      total: 1,
      summary: expect.objectContaining({
        totalTraces: 1,
        errorTraces: 0,
        p95Duration: 180,
        p99Duration: 180,
      }),
    });
  });

  it('preserves compatibility with snake_case payloads', async () => {
    vi.mocked(tracesService.getTraces).mockResolvedValueOnce({
      traces: [
        {
          span_id: 'span-2',
          trace_id: 'trace-2',
          service_name: 'inventory-service',
          operation_name: 'GET /stock',
          start_time: '2026-03-14T19:00:00Z',
          end_time: '2026-03-14T19:00:00.09Z',
          duration_ms: 90,
          status: 'ERROR',
          span_kind: 'SERVER',
          http_method: 'GET',
          http_status_code: 500,
        },
      ],
      total: 2,
      summary: {
        total_traces: 2,
        error_traces: 1,
        p95_duration: 90,
        p99_duration: 90,
      },
    });

    await expect(tracesApi.getTraces(1, 1, 2, {})).resolves.toEqual({
      traces: [
        expect.objectContaining({
          span_id: 'span-2',
          trace_id: 'trace-2',
          service_name: 'inventory-service',
          operation_name: 'GET /stock',
          duration_ms: 90,
          status: 'ERROR',
          span_kind: 'SERVER',
        }),
      ],
      total: 2,
      summary: expect.objectContaining({
        total_traces: 2,
        error_traces: 1,
        p95_duration: 90,
        p99_duration: 90,
      }),
    });
  });
});
