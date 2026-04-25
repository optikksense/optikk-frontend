import { memo, useMemo } from "react";

import type { AnalyticsResponse } from "../../types/analytics";

/**
 * Minimal treemap using flexbox-weighted tiles. Not a true squarified layout —
 * a honest 80/20 for O12 that avoids pulling in d3-hierarchy. Tile size ≈ count,
 * color intensity ≈ error_rate when available.
 */
function AnalyticsTreemapComponent({ data }: { data: AnalyticsResponse }) {
  const tiles = useMemo(() => buildTiles(data), [data]);
  if (tiles.length === 0) {
    return <Empty msg="Treemap needs a groupBy (non-time) column. Switch viz or adjust toolbar." />;
  }
  const total = tiles.reduce((acc, t) => acc + t.count, 0);
  return (
    <div className="flex h-full flex-col overflow-hidden p-3">
      <div className="flex h-full min-h-[240px] flex-wrap gap-[2px]">
        {tiles.map((t) => (
          <div
            key={t.label}
            title={`${t.label} · ${t.count}${t.errorRate !== null ? ` · ${(t.errorRate * 100).toFixed(1)}% err` : ""}`}
            style={{
              flexGrow: Math.max(1, Math.round((t.count / total) * 1000)),
              flexBasis: 0,
              minWidth: 60,
              minHeight: 40,
              backgroundColor: tileColor(t.errorRate),
            }}
            className="flex items-center justify-center overflow-hidden rounded px-1 text-center"
          >
            <span className="truncate text-[11px] font-semibold text-[var(--text-primary)]">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Tile {
  readonly label: string;
  readonly count: number;
  /** null if no error_count column in the response. */
  readonly errorRate: number | null;
}

function buildTiles(data: AnalyticsResponse): readonly Tile[] {
  const tsIdx = data.columns.findIndex((c) => c.name === "time_bucket");
  const groupIdx = data.columns.findIndex((c, i) => i !== tsIdx && c.type === "string");
  if (groupIdx < 0) return [];
  const countIdx = data.columns.findIndex((c) => c.name === "count");
  const errorIdx = data.columns.findIndex((c) => c.name === "error_count");
  const acc = new Map<string, { count: number; errors: number }>();
  for (const r of data.rows) {
    const label = String(r[groupIdx] ?? "(unknown)");
    const count = countIdx >= 0 ? Number(r[countIdx]) : 1;
    const errors = errorIdx >= 0 ? Number(r[errorIdx]) : 0;
    const prev = acc.get(label) ?? { count: 0, errors: 0 };
    acc.set(label, { count: prev.count + count, errors: prev.errors + errors });
  }
  return Array.from(acc.entries())
    .map(([label, v]) => ({
      label,
      count: v.count,
      errorRate: errorIdx >= 0 && v.count > 0 ? v.errors / v.count : null,
    }))
    .sort((a, b) => b.count - a.count);
}

function tileColor(errorRate: number | null): string {
  if (errorRate === null) return "rgba(78, 159, 221, 0.35)";
  const t = Math.min(1, errorRate * 2);
  return `rgba(232, 73, 77, ${Math.max(0.2, t).toFixed(2)})`;
}

function Empty({ msg }: { msg: string }) {
  return <div className="flex h-full items-center justify-center px-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}

export const AnalyticsTreemap = memo(AnalyticsTreemapComponent);
