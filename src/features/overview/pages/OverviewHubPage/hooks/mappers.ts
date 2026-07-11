import type { DashboardRecord } from "@shared/types/dashboardConfig";

export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

export function mapRedRequestRateRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      value: num(r.request_count ?? r.value ?? r.rps),
      request_count: num(r.request_count ?? r.rps),
    };
  });
}

export function mapRedErrorPctRows(rows: unknown[]): DashboardRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    const pct = num(r.error_pct ?? r.error_rate);
    return {
      timestamp: str(r.timestamp ?? r.time_bucket),
      error_pct: pct,
      error_rate: pct,
      error_count: num(r.error_count),
      request_count: num(r.request_count),
    };
  });
}
