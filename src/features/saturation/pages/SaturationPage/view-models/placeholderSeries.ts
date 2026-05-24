const POINTS = 30;
const TWO_PI = Math.PI * 2;

/**
 * Deterministic stub sparkline series.
 *
 * The backend does not currently return a per-card series, so we synthesize a
 * pleasing curve whose amplitude is anchored to the headline value. Same seed
 * always yields the same shape, so renders are stable between refreshes.
 */
export function placeholderSeries(seed: number, points: number = POINTS): number[] {
  const safeSeed = Number.isFinite(seed) && seed > 0 ? seed : 1;
  const amplitude = safeSeed * 0.12;
  const series: number[] = [];
  for (let i = 0; i < points; i++) {
    const phase = (i / points) * TWO_PI;
    const wobble = Math.sin(phase * 2 + safeSeed) * amplitude;
    series.push(Math.max(0, safeSeed + wobble));
  }
  return series;
}
