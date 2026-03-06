import { describe, expect, it } from 'vitest';

import { buildSSEStreamUrl } from './useSSE';

describe('buildSSEStreamUrl', () => {
  it('builds /api/v1 stream URLs and preserves query params', () => {
    const url = buildSSEStreamUrl('/api', 'token value', 9);
    expect(url).toBe('/api/v1/events/stream?token=token+value&teamId=9');
  });

  it('normalizes trailing slash in API base URL', () => {
    const url = buildSSEStreamUrl('http://localhost:8080/api/', 'abc', 10);
    expect(url).toBe('http://localhost:8080/api/v1/events/stream?token=abc&teamId=10');
  });
});
