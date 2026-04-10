/**
 * AI Observability — Shared formatting utilities.
 * Eliminates duplication of formatNumber across all AI pages.
 */

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(0)}ms`;
}

export function formatCost(usd: number): string {
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  if (usd >= 0.01) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(4)}`;
}

export function formatPercent(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

export function formatTokenRate(tokPerSec: number): string {
  return `${tokPerSec.toFixed(1)} tok/s`;
}
