import { describe, expect, it } from 'vitest';

import { compileLogsStructuredFilters, upsertLogFacetFilter } from './logUtils';

describe('feature logUtils', () => {
  it('compiles structured filters into backend log params', () => {
    expect(
      compileLogsStructuredFilters([
        { field: 'service_name', operator: 'equals', value: 'checkout-service' },
        { field: 'level', operator: 'not_equals', value: 'INFO' },
        { field: 'host', operator: 'equals', value: 'host-a' },
        { field: 'trace_id', operator: 'equals', value: 'trace-1' },
        { field: 'span_id', operator: 'equals', value: 'span-1' },
        { field: 'user_id', operator: 'equals', value: '42' },
      ]),
    ).toEqual({
      services: ['checkout-service'],
      excludeSeverities: ['INFO'],
      hosts: ['host-a'],
      traceId: 'trace-1',
      spanId: 'span-1',
      attributeFilters: [
        {
          key: 'user_id',
          value: '42',
          op: 'eq',
        },
      ],
    });
  });

  it('upserts log facet filters by field', () => {
    expect(
      upsertLogFacetFilter(
        [{ field: 'service_name', operator: 'equals', value: 'payments' }],
        'service_name',
        'checkout',
      ),
    ).toEqual([{ field: 'service_name', operator: 'equals', value: 'checkout' }]);

    expect(
      upsertLogFacetFilter(
        [{ field: 'level', operator: 'equals', value: 'ERROR' }],
        'level',
        null,
      ),
    ).toEqual([]);
  });
});
