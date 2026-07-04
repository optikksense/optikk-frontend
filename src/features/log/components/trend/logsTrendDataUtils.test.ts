import { describe, it, expect } from 'vitest';
import { parseBucketMs, prepareLogsTrendData, buildCumulativeSeries } from './logsTrendDataUtils';

describe('LogsTrendChart Data Utilities', () => {
  describe('parseBucketMs', () => {
    it('parses typical postgres ISO timestamp', () => {
      const ms = parseBucketMs("2023-10-01 12:00:00", 0);
      expect(ms).toBe(Date.parse("2023-10-01T12:00:00Z"));
    });

    it('parses UTC timestamp', () => {
      const ms = parseBucketMs("2023-10-01T12:00:00Z", 0);
      expect(ms).toBe(Date.parse("2023-10-01T12:00:00Z"));
    });

    it('returns idx if invalid', () => {
      const ms = parseBucketMs("invalid", 5);
      expect(ms).toBe(5);
    });
  });

  describe('prepareLogsTrendData & buildCumulativeSeries', () => {
    it('calculates stacked/cumulative series correctly (before/after equal test)', () => {
      const trend = [
        { time_bucket: "2023-10-01T12:00:00Z", debug: 10, info: 20, warn: 5, error: 2, total: 37 },
        { time_bucket: "2023-10-01T12:01:00Z", debug: 5, info: 50, warn: 1, error: 0, total: 56 },
      ];

      const buckets = prepareLogsTrendData(trend);
      expect(buckets).toHaveLength(2);
      expect(buckets[0].ts).toBe(Date.parse("2023-10-01T12:00:00Z"));
      expect(buckets[0].err).toBe(2);

      const [timestamps, errSeries, warnSeries, infoSeries, debugSeries] = buildCumulativeSeries(buckets);
      
      // Timestamps in seconds
      expect(timestamps[0]).toBe(Date.parse("2023-10-01T12:00:00Z") / 1000);
      expect(timestamps[1]).toBe(Date.parse("2023-10-01T12:01:00Z") / 1000);

      // Bucket 0 totals: D=10, I=10+20=30, W=30+5=35, E=35+2=37
      expect(debugSeries[0]).toBe(10);
      expect(infoSeries[0]).toBe(30);
      expect(warnSeries[0]).toBe(35);
      expect(errSeries[0]).toBe(37);

      // Bucket 1 totals: D=5, I=5+50=55, W=55+1=56, E=56+0=56
      expect(debugSeries[1]).toBe(5);
      expect(infoSeries[1]).toBe(55);
      expect(warnSeries[1]).toBe(56);
      expect(errSeries[1]).toBe(56);
    });
  });
});
