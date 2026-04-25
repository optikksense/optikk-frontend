import { memo, useMemo } from "react";

import type { AnalyticsResponse } from "../../types/analytics";

/**
 * Heatmap viz for traces analytics (O12). Y-axis = group value (e.g. service),
 * X-axis = time_bucket, cell color intensity = count. Fall-back to a flat
 * column when response has no time axis.
 */
function AnalyticsHeatmapComponent({ data }: { data: AnalyticsResponse }) {
  const grid = useMemo(() => buildGrid(data), [data]);
  if (grid.xs.length === 0 || grid.ys.length === 0) {
    return <Empty msg="Heatmap needs a groupBy field and a time axis. Switch viz or adjust toolbar." />;
  }
  return (
    <div className="flex h-full flex-col overflow-hidden p-3">
      <div className="flex-1 overflow-auto">
        <table className="border-separate border-spacing-[1px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[var(--bg-primary)] px-2 py-1 text-left text-[10px] font-semibold uppercase text-[var(--text-muted)]" />
              {grid.xs.map((x) => (
                <th key={x} className="px-1 py-1 text-[9px] text-[var(--text-muted)]" title={x}>
                  {x.slice(11, 16)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.ys.map((y) => (
              <tr key={y}>
                <td className="sticky left-0 z-10 bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                  {y}
                </td>
                {grid.xs.map((x) => {
                  const v = grid.cells.get(cellKey(y, x)) ?? 0;
                  return (
                    <td
                      key={x}
                      title={`${y} · ${x} · ${v}`}
                      style={{ backgroundColor: cellColor(v, grid.max) }}
                      className="h-5 w-5 min-w-[20px] cursor-pointer"
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Legend max={grid.max} />
    </div>
  );
}

interface HeatmapGrid {
  readonly xs: readonly string[];
  readonly ys: readonly string[];
  readonly cells: ReadonlyMap<string, number>;
  readonly max: number;
}

function buildGrid(data: AnalyticsResponse): HeatmapGrid {
  const tsIdx = data.columns.findIndex((c) => c.name === "time_bucket");
  if (tsIdx < 0) return { xs: [], ys: [], cells: new Map(), max: 0 };
  const countIdx = pickCountColumn(data);
  const groupIdx = pickGroupColumn(data, tsIdx);
  if (countIdx < 0 || groupIdx < 0) return { xs: [], ys: [], cells: new Map(), max: 0 };
  const xs = uniqueSorted(data.rows.map((r) => String(r[tsIdx])));
  const ys = uniqueSorted(data.rows.map((r) => String(r[groupIdx])));
  const cells = new Map<string, number>();
  let max = 0;
  for (const r of data.rows) {
    const n = Number(r[countIdx]);
    const key = cellKey(String(r[groupIdx]), String(r[tsIdx]));
    cells.set(key, n);
    if (n > max) max = n;
  }
  return { xs, ys, cells, max };
}

function pickCountColumn(data: AnalyticsResponse): number {
  const prefer = ["count", "error_count", "p95"];
  for (const p of prefer) {
    const i = data.columns.findIndex((c) => c.name === p);
    if (i >= 0) return i;
  }
  return data.columns.findIndex((c) => c.type === "number");
}

function pickGroupColumn(data: AnalyticsResponse, tsIdx: number): number {
  return data.columns.findIndex((c, i) => i !== tsIdx && c.type === "string");
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values)).sort();
}

function cellKey(y: string, x: string): string {
  return `${y}\x00${x}`;
}

function cellColor(v: number, max: number): string {
  if (max <= 0 || v <= 0) return "var(--bg-secondary)";
  const t = Math.min(1, v / max);
  const alpha = Math.max(0.08, t).toFixed(2);
  return `rgba(78, 159, 221, ${alpha})`;
}

function Legend({ max }: { max: number }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
      <span>0</span>
      <span className="h-2 w-24 rounded" style={{ background: "linear-gradient(to right, var(--bg-secondary), rgba(78,159,221,1))" }} />
      <span>{max}</span>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="flex h-full items-center justify-center px-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}

export const AnalyticsHeatmap = memo(AnalyticsHeatmapComponent);
