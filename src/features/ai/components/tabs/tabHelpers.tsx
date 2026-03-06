/**
 *
 * @param value
 */
export function n(value: any): number | null {
  const num = Number(value);
  return Number.isNaN(num) ? null : Math.round(num * 100000) / 100000;
}

/**
 *
 * @param value
 * @param decimals
 */
export function pct(value: any, decimals = 1): string {
  const num = n(value);
  return num == null ? 'N/A' : `${num.toFixed(decimals)}%`;
}

/**
 *
 * @param value
 * @param decimals
 */
export function dollar(value: any, decimals = 4): string {
  const num = n(value);
  return num == null ? 'N/A' : `$${num.toFixed(decimals)}`;
}

/**
 *
 */
export function naSpan() {
  return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
}

/**
 *
 * @param ms
 */
export function latColor(ms: any): string {
  return ms > 5000 ? '#F04438' : ms > 2000 ? '#F79009' : '#73C991';
}

/**
 *
 * @param rate
 */
export function rateColor(rate: any): string {
  return rate > 5 ? '#F04438' : rate > 1 ? '#F79009' : '#73C991';
}
