/**
 * Aligns two pre-aggregated series (each a parallel timestamps/values pair) onto
 * a single shared, sorted timeline — used when two endpoints are charted together.
 */

export interface AlignedPair {
  readonly timestamps: number[];
  readonly a: number[];
  readonly b: number[];
}

function byTimestamp(timestamps: readonly number[], values: readonly number[]): Map<number, number> {
  return new Map(timestamps.map((t, i) => [t, values[i] ?? 0]));
}

export function mergeTwoSeries(
  aTimestamps: readonly number[],
  aValues: readonly number[],
  bTimestamps: readonly number[],
  bValues: readonly number[]
): AlignedPair {
  const aByTs = byTimestamp(aTimestamps, aValues);
  const bByTs = byTimestamp(bTimestamps, bValues);
  const timestamps = Array.from(new Set<number>([...aTimestamps, ...bTimestamps])).sort(
    (x, y) => x - y
  );
  return {
    timestamps,
    a: timestamps.map((t) => aByTs.get(t) ?? 0),
    b: timestamps.map((t) => bByTs.get(t) ?? 0),
  };
}
