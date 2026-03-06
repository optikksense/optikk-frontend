import { describe, expect, it } from 'vitest';

import {
  compareIdsDesc,
  extractServerTotal,
  getHasMoreFromPage,
  getLogsFromPage,
  getLogValue,
  getNextCursorFromPage,
  getTimestampMs,
  parseTimestampMs,
  rowKey,
  toBigIntId,
} from './logUtils';

describe('logUtils', () => {
  it('extracts logs from supported page shapes', () => {
    expect(getLogsFromPage({ logs: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(getLogsFromPage({ items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(getLogsFromPage({ rows: [{ id: 3 }] })).toEqual([{ id: 3 }]);
    expect(getLogsFromPage(null)).toEqual([]);
  });

  it('detects whether more log pages exist', () => {
    expect(getHasMoreFromPage({ has_more: false }, [], 50)).toBe(false);
    expect(
      getHasMoreFromPage(
        { total_count: 10, logs: [{ id: 1 }, { id: 2 }] },
        [{ logs: [{ id: 1 }, { id: 2 }] }, { logs: [{ id: 3 }] }],
        50,
      ),
    ).toBe(true);
    expect(getHasMoreFromPage({ logs: new Array(50).fill({}) }, [], 50)).toBe(true);
    expect(getHasMoreFromPage({ logs: new Array(20).fill({}) }, [], 50)).toBe(false);
  });

  it('resolves cursors from metadata or the trailing row id', () => {
    expect(getNextCursorFromPage({ next_cursor: 'abc', logs: [{ id: 10 }] })).toBe('abc');
    expect(getNextCursorFromPage({ logs: [{ id: '99' }] })).toBe('99');
    expect(getNextCursorFromPage({ logs: [{ id: '0' }] })).toBeUndefined();
  });

  it('parses timestamps from numeric, textual, and date inputs', () => {
    expect(parseTimestampMs(1_700_000_000_123)).toBe(1_700_000_000_123);
    expect(parseTimestampMs(1_700_000_000_123_456)).toBe(1_700_000_000_123);
    expect(parseTimestampMs('1700000000123456789')).toBe(1_700_000_000_123);
    expect(parseTimestampMs('2026-03-01 12:34:56')).toBe(new Date('2026-03-01T12:34:56').getTime());
    expect(parseTimestampMs(new Date('2026-03-01T12:34:56.000Z'))).toBe(
      new Date('2026-03-01T12:34:56.000Z').getTime(),
    );
    expect(parseTimestampMs('')).toBe(0);
    expect(getTimestampMs({ timestamp: '2026-03-01T00:00:00.000Z' })).toBe(1_772_323_200_000);
  });

  it('handles bigint id conversion and descending comparisons', () => {
    expect(toBigIntId('9007199254740995')).toBe(9007199254740995n);
    expect(toBigIntId('bad')).toBeNull();
    expect(compareIdsDesc('9007199254740995', '9007199254740994')).toBe(-1);
    expect(compareIdsDesc('alpha', 'beta')).toBeGreaterThan(0);
    expect(compareIdsDesc('42', 42)).toBe(0);
  });

  it('reads common log fields and derives stable row keys', () => {
    expect(getLogValue({ serviceName: 'api' }, 'service_name')).toBe('api');
    expect(getLogValue({ trace_id: 't-1' }, 'trace_id')).toBe('t-1');
    expect(getLogValue({ spanId: 's-1' }, 'span_id')).toBe('s-1');
    expect(getLogValue({ message: 'hello' }, 'message')).toBe('hello');

    expect(rowKey({ id: '55', timestamp: 'a' }, 0)).toBe('log-55');
    expect(rowKey({ traceId: 'trace', spanId: 'span', timestamp: '2026-03-01' }, 1)).toBe('trace-span-2026-03-01');
    expect(rowKey({ timestamp: '2026-03-01' }, 7)).toBe('log-7-2026-03-01');
  });

  it('extracts the server total from common metadata shapes', () => {
    expect(extractServerTotal([{ pagination: { total_count: 33 } }])).toBe(33);
    expect(extractServerTotal([{ totalCount: 21 }])).toBe(21);
    expect(extractServerTotal([])).toBe(0);
  });
});
