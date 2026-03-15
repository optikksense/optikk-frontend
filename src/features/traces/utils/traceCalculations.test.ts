import { describe, expect, it } from 'vitest';

import { normalizeSpan, normalizeTraceLog } from './traceCalculations';

describe('trace calculations', () => {
  it('normalizes spans from snake_case trace payloads', () => {
    expect(
      normalizeSpan({
        span_id: 'span-1',
        trace_id: 'trace-1',
        service_name: 'checkout-service',
        operation_name: 'POST /api/v1/orders',
        parent_span_id: '',
        span_kind: 'SERVER',
        duration_ms: '180',
        start_time: '2026-03-01T10:00:00Z',
        end_time: '2026-03-01T10:00:00.180Z',
        status: 'OK',
      }),
    ).toMatchObject({
      span_id: 'span-1',
      trace_id: 'trace-1',
      service_name: 'checkout-service',
      duration_ms: 180,
      status: 'OK',
    });
  });

  it('normalizes trace logs from snake_case trace detail payloads', () => {
    expect(
      normalizeTraceLog({
        timestamp: '2026-03-01T10:00:00Z',
        service_name: 'checkout-service',
        trace_id: 'trace-1',
        span_id: 'span-1',
        level: 'ERROR',
        message: 'payment gateway timeout',
      }),
    ).toEqual({
      timestamp: '2026-03-01T10:00:00Z',
      service_name: 'checkout-service',
      trace_id: 'trace-1',
      span_id: 'span-1',
      level: 'ERROR',
      message: 'payment gateway timeout',
    });
  });
});
